param(
    [string]$MangoBoxRepo = 'D:\MangoBoxLocal\MangoBox',
    [string]$PublicRepo = 'circleoyang/MangoBox-Platform'
)

$ErrorActionPreference = 'Stop'

$Tag = 'mangothonny-v0.4.0'
$Title = 'MangoThonny v0.4.0'
$ExpectedPortableHash = '24936c64a4b6b87ffe2969e4f7570227da4bfe89d313ab44ba44f05e4002ae16'
$ExpectedInstallerHash = '01d4e994961220259c2ab593df6a043dc5a58a61e10868a746eac4820bc87c80'

$Portable = Join-Path $MangoBoxRepo 'pc\mangothonny\build\out\MangoThonny-Portable-v0.4.0.zip'
$PortableHashFile = Join-Path $MangoBoxRepo 'pc\mangothonny\build\out\MangoThonny-Portable-v0.4.0.sha256.txt'
$Installer = Join-Path $MangoBoxRepo 'pc\mangothonny\build\out\installer\MangoThonny-Setup-v0.4.0.exe'
$InstallerHashFile = "$Installer.sha256.txt"
$Notes = Join-Path (Split-Path -Parent $PSScriptRoot) 'releases\notes\mangothonny-v0.4.0.md'

function Require-File([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Required file not found: $Path"
    }
}

function Assert-Hash([string]$Path, [string]$Expected) {
    $actual = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $Expected.ToLowerInvariant()) {
        throw "SHA-256 mismatch for $Path`nExpected: $Expected`nActual:   $actual"
    }
    Write-Host "[PASS] SHA-256 $([IO.Path]::GetFileName($Path)): $actual" -ForegroundColor Green
}

Write-Host '============================================================'
Write-Host 'MangoThonny v0.4.0 Public Release Publisher'
Write-Host "Repository : $PublicRepo"
Write-Host "Tag        : $Tag"
Write-Host '============================================================'

$null = Get-Command gh -ErrorAction Stop
& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI authentication failed.' }

Require-File $Portable
Require-File $PortableHashFile
Require-File $Installer
Require-File $InstallerHashFile
Require-File $Notes

Assert-Hash $Portable $ExpectedPortableHash
Assert-Hash $Installer $ExpectedInstallerHash

$portableSidecar = (Get-Content -LiteralPath $PortableHashFile -Raw).ToLowerInvariant()
if ($portableSidecar -notmatch [regex]::Escape($ExpectedPortableHash)) {
    throw 'Portable SHA sidecar does not contain the expected final hash.'
}

$installerSidecar = (Get-Content -LiteralPath $InstallerHashFile -Raw).ToLowerInvariant()
if ($installerSidecar -notmatch [regex]::Escape($ExpectedInstallerHash)) {
    throw 'Installer SHA sidecar does not contain the expected final hash.'
}

& gh release view $Tag --repo $PublicRepo *> $null
if ($LASTEXITCODE -eq 0) {
    throw "Release already exists: $Tag. Refusing to overwrite existing public release evidence."
}

Write-Host '[CREATE] Creating stable GitHub Release...'
& gh release create $Tag `
    --repo $PublicRepo `
    --title $Title `
    --notes-file $Notes `
    --target main `
    $Portable `
    $PortableHashFile `
    $Installer `
    $InstallerHashFile

if ($LASTEXITCODE -ne 0) {
    throw "gh release create failed with exit code $LASTEXITCODE"
}

Write-Host '[VERIFY] Reading back public release...'
& gh release view $Tag --repo $PublicRepo --json url,isDraft,isPrerelease,tagName,name,publishedAt
if ($LASTEXITCODE -ne 0) {
    throw 'Release verification failed.'
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Green
Write-Host '[PASS] MangoThonny v0.4.0 publication PASS' -ForegroundColor Green
Write-Host "https://github.com/$PublicRepo/releases/tag/$Tag"
Write-Host 'Published assets:'
Write-Host '  MangoThonny-Portable-v0.4.0.zip'
Write-Host '  MangoThonny-Portable-v0.4.0.sha256.txt'
Write-Host '  MangoThonny-Setup-v0.4.0.exe'
Write-Host '  MangoThonny-Setup-v0.4.0.exe.sha256.txt'
Write-Host '============================================================' -ForegroundColor Green
