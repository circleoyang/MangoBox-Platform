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
    $existing = (Invoke-Gh -Arguments @("release","list","--repo",$repo,"--limit","1000","--json","tagName")) | ConvertFrom-Json
    if (-not @($existing | Where-Object { $_.tagName -ceq $tag }).Count) {
        Invoke-Gh -Arguments @("release","create",$tag,"--repo",$repo,"--target","main","--draft","--title",$release.title,"--notes-file",$notes) | Out-Host
    }
    $uploads = @()
    foreach ($asset in $release.assets) {
        $uploads += [pscustomobject]@{ Name=$asset.name; Path=(Join-Path $BundlePath $asset.path); Hash=$asset.sha256 }
    }
    $uploads += [pscustomobject]@{ Name=(Split-Path $sumPath -Leaf); Path=$sumPath; Hash=(Get-FileHash $sumPath -Algorithm SHA256).Hash.ToLowerInvariant() }
    foreach ($item in $uploads) {
        $remote = (Invoke-Gh -Arguments @("api","repos/$repo/releases/tags/$tag")) | ConvertFrom-Json
        $found = @($remote.assets | Where-Object { $_.name -ceq $item.Name })
        if ($found.Count -gt 0) {
            if ($found.Count -ne 1 -or $found[0].digest -ne ("sha256:" + $item.Hash)) { throw "Existing remote asset differs or has no digest: $($item.Name)" }
        } else {
            if (-not $remote.draft) { throw "Published release is missing an asset; refusing to modify it: $tag" }
            Invoke-Gh -Arguments @("release","upload",$tag,$item.Path,"--repo",$repo) | Out-Host
        }
    }
}
# Verify every remote binary and checksum file before publishing any draft.
foreach ($release in $spec.releases) {
    $remote = (Invoke-Gh -Arguments @("api","repos/$repo/releases/tags/$($release.tag)")) | ConvertFrom-Json
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
    Invoke-Gh -Arguments @("release","edit",$release.tag,"--repo",$repo,"--draft=false","--prerelease=false","--latest=false") | Out-Host
}
Write-Host "PUBLICATION PASS: Hardware Lab v0.3.0 and all five firmware releases."
Write-Host "Website PR can now be verified and merged. No local build was run."
