param(
    [string]$PublicRepo = 'circleoyang/MangoBox-Platform'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

$items = @(
    @{ Tag='mangox2-pico-v0.2.8';   Notes='releases\notes\mangox2-pico-v0.2.8.md' },
    @{ Tag='mangox2-picow-v0.2.8';  Notes='releases\notes\mangox2-picow-v0.2.8.md' },
    @{ Tag='mangox2-pico2w-v0.2.8'; Notes='releases\notes\mangox2-pico2w-v0.2.8.md' },
    @{ Tag='mangolite-picow-v0.6.3'; Notes='releases\notes\mangolite-picow-v0.6.3.md' },
    @{ Tag='mangolite-pico2w-v0.6.3';Notes='releases\notes\mangolite-pico2w-v0.6.3.md' },
    @{ Tag='device-manager-v0.5.2';  Notes='releases\notes\device-manager-v0.5.2.md' }
)

$null = Get-Command gh -ErrorAction Stop
& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI authentication failed.' }

foreach ($item in $items) {
    $path = Join-Path $root $item.Notes
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Missing release notes file: $path"
    }

    Write-Host "[UPDATE] $($item.Tag)"
    & gh release edit $item.Tag --repo $PublicRepo --notes-file $path
    if ($LASTEXITCODE -ne 0) {
        throw "gh release edit failed: $($item.Tag)"
    }

    $check = & gh release view $item.Tag --repo $PublicRepo --json tagName,isDraft,isPrerelease,url
    if ($LASTEXITCODE -ne 0) { throw "Cannot verify release: $($item.Tag)" }
    Write-Host "[PASS] $($item.Tag)"
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Green
Write-Host '[PASS] Stable release notes refreshed from UTF-8 repository files' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Green
