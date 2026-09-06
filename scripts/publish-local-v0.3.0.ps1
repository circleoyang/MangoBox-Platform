param(
    [string]$BundlePath = "D:\MangoBoxLocal\MangoBox\pc\hardware-lab\release\v0.3.0\Local_Release_Bundle"
)
$ErrorActionPreference = "Stop"
# Existing local binaries only. No build, CI dispatch or source upload.
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) is required. Install it and run gh auth login first."
}
function Invoke-Gh {
    param([string[]]$Arguments)
    $result = & gh @Arguments
    if ($LASTEXITCODE -ne 0) { throw "GitHub CLI failed: $($Arguments[0])" }
    return $result
}
Invoke-Gh -Arguments @("auth", "status") | Out-Host
$repo = "circleoyang/MangoBox-Platform"
$branch = "release/hl-v0.3.0-five-firmware"
$tempDir = Join-Path ([IO.Path]::GetTempPath()) ("mangobox-publish-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Read-PublicFile([string]$Path) {
    $raw = Invoke-Gh -Arguments @("api", "repos/$repo/contents/$($Path)?ref=$branch", "--jq", ".content")
    return [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(($raw -join "")))
}
function Find-Release([string]$Tag) {
    # The tag endpoint does not find an unpublished draft. List drafts, then use ID.
    $pageNumber = 1
    do {
        $pageItems = @((Invoke-Gh -Arguments @("api", "repos/$repo/releases?per_page=100&page=$pageNumber")) | ConvertFrom-Json)
        $matches = @($pageItems | Where-Object { $_.tag_name -ceq $Tag })
        if ($matches.Count -gt 1) { throw "Multiple releases found for tag: $Tag" }
        if ($matches.Count -eq 1) { return $matches[0] }
        $pageNumber++
    } while ($pageItems.Count -eq 100)
    return $null
}
$releaseIds = @{}
$spec = (Read-PublicFile "releases/local-v0.3.0-publication.json") | ConvertFrom-Json
# Validate all seven local artifacts before creating a release.
foreach ($release in $spec.releases) {
    foreach ($asset in $release.assets) {
        $local = Join-Path $BundlePath $asset.path
        if (-not (Test-Path -LiteralPath $local -PathType Leaf)) { throw "Missing file: $local" }
        $actual = (Get-FileHash -LiteralPath $local -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $asset.sha256) { throw "SHA-256 mismatch: $local" }
    }
}
foreach ($release in $spec.releases) {
    $tag = $release.tag
    $notes = Join-Path $tempDir "$tag.md"
    [IO.File]::WriteAllText($notes, (Read-PublicFile "releases/notes/$tag.md"), $utf8)
    $sumPath = Join-Path $tempDir "$tag-SHA256SUMS.txt"
    $sumText = (($release.assets | ForEach-Object { "$($_.sha256)  $($_.name)" }) -join [Environment]::NewLine) + [Environment]::NewLine
    [IO.File]::WriteAllText($sumPath, $sumText, $utf8)
    $existing = Find-Release $tag
    if ($null -eq $existing) {
        Invoke-Gh -Arguments @("release","create",$tag,"--repo",$repo,"--target","main","--draft","--title",$release.title,"--notes-file",$notes) | Out-Host
    }
    $existing = Find-Release $tag
    if ($null -eq $existing -or -not $existing.id) { throw "Cannot resolve release ID: $tag" }
    $releaseIds[$tag] = $existing.id
    Write-Host "Release $tag (ID $($existing.id))"
    $uploads = @()
    foreach ($asset in $release.assets) {
        $uploads += [pscustomobject]@{ Name=$asset.name; Path=(Join-Path $BundlePath $asset.path); Hash=$asset.sha256 }
    }
    $uploads += [pscustomobject]@{ Name=(Split-Path $sumPath -Leaf); Path=$sumPath; Hash=(Get-FileHash $sumPath -Algorithm SHA256).Hash.ToLowerInvariant() }
    foreach ($item in $uploads) {
        $remote = (Invoke-Gh -Arguments @("api","repos/$repo/releases/$($releaseIds[$tag])")) | ConvertFrom-Json
        $found = @($remote.assets | Where-Object { $_.name -ceq $item.Name })
        if ($found.Count -gt 0) {
            if ($found.Count -ne 1 -or $found[0].digest -ne ("sha256:" + $item.Hash)) { throw "Existing remote asset differs or has no digest: $($item.Name)" }
        } else {
            if (-not $remote.draft) { throw "Published release is missing an asset; refusing to modify it: $tag" }
            $assetName = [Uri]::EscapeDataString($item.Name)
            $uploadUrl = "https://uploads.github.com/repos/$repo/releases/$($releaseIds[$tag])/assets?name=$assetName"
            Write-Host "Uploading $($item.Name)"
            Invoke-Gh -Arguments @("api",$uploadUrl,"--method","POST","--header","Content-Type: application/octet-stream","--input",$item.Path) | Out-Null
        }
    }
}
# Verify every remote binary and checksum file before publishing any draft.
foreach ($release in $spec.releases) {
    $remote = (Invoke-Gh -Arguments @("api","repos/$repo/releases/$($releaseIds[$release.tag])")) | ConvertFrom-Json
    foreach ($asset in $release.assets) {
        $found = @($remote.assets | Where-Object { $_.name -ceq $asset.name })
        if ($found.Count -ne 1 -or $found[0].digest -ne ("sha256:" + $asset.sha256)) { throw "Remote verification failed: $($asset.name)" }
    }
    $sumName = "$($release.tag)-SHA256SUMS.txt"
    $sumHash = (Get-FileHash (Join-Path $tempDir $sumName) -Algorithm SHA256).Hash.ToLowerInvariant()
    $foundSum = @($remote.assets | Where-Object { $_.name -ceq $sumName })
    if ($foundSum.Count -ne 1 -or $foundSum[0].digest -ne ("sha256:" + $sumHash)) { throw "Remote checksum verification failed: $sumName" }
}
foreach ($release in $spec.releases) {
    $endpoint = "repos/$repo/releases/$($releaseIds[$release.tag])"
    Invoke-Gh -Arguments @("api",$endpoint,"--method","PATCH","-F","draft=false","-F","prerelease=false","-f","make_latest=false") | Out-Null
    $published = (Invoke-Gh -Arguments @("api",$endpoint)) | ConvertFrom-Json
    if ($published.draft -or $published.prerelease) { throw "Release publication not confirmed: $($release.tag)" }
    Write-Host $published.html_url
}
Write-Host "PUBLICATION PASS: Hardware Lab v0.3.0 and all five firmware releases."
Write-Host "Website PR can now be verified and merged. No local build was run."
