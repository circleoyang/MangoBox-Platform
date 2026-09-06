param(
    [string]$MangoBoxRepo = 'D:\MangoBoxLocal\MangoBox',
    [string]$PublicRepo = 'circleoyang/MangoBox-Platform'
)

$ErrorActionPreference = 'Stop'

$Tag = 'device-manager-v0.5.0'
$Title = 'MangoBox Device Manager v0.5.0'
$ExpectedPortableHash = '5619ceabcf2f5393df54898c5b2443a4927c70bae541bfd331d8bacd14cb0182'
$ExpectedInstallerHash = 'd011d45b2542c591632eadbc98c7f4d6aaddfbad8c38718b45ba431be84d4d80'

$ReleaseDir = Join-Path $MangoBoxRepo 'pc\device-manager\release'
$Portable = Join-Path $ReleaseDir 'MangoBox_Device_Manager_v0.5.0_Portable.zip'
$PortableHashFile = Join-Path $ReleaseDir 'MangoBox_Device_Manager_v0.5.0_Portable.zip.sha256.txt'
$Installer = Join-Path $ReleaseDir 'MangoBox_Device_Manager_v0.5.0_Setup.exe'
$InstallerHashFile = Join-Path $ReleaseDir 'MangoBox_Device_Manager_v0.5.0_Setup.exe.sha256.txt'
$Notes = Join-Path (Split-Path -Parent $PSScriptRoot) 'releases\notes\device-manager-v0.5.0.md'

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
Write-Host 'MangoBox Device Manager v0.5.0 Public Release Publisher'
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

# A missing release is the expected first-publication state. Windows PowerShell 5.1
# may promote native stderr from `gh release view` into a terminating error, so
# probe existence through cmd.exe and inspect only the exit code.
$probeCommand = 'gh release view "{0}" --repo "{1}" >nul 2>nul' -f $Tag, $PublicRepo
& $env:ComSpec /d /s /c $probeCommand
$releaseProbeExitCode = $LASTEXITCODE

if ($releaseProbeExitCode -eq 0) {
    throw "Release already exists: $Tag. Refusing to overwrite existing public release evidence."
}

Write-Host '[PASS] Public release tag does not exist yet; safe to create.' -ForegroundColor Green
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
Write-Host '[PASS] Device Manager v0.5.0 publication PASS' -ForegroundColor Green
Write-Host "https://github.com/$PublicRepo/releases/tag/$Tag"
Write-Host 'Published assets:'
Write-Host '  MangoBox_Device_Manager_v0.5.0_Portable.zip'
Write-Host '  MangoBox_Device_Manager_v0.5.0_Portable.zip.sha256.txt'
Write-Host '  MangoBox_Device_Manager_v0.5.0_Setup.exe'
Write-Host '  MangoBox_Device_Manager_v0.5.0_Setup.exe.sha256.txt'
Write-Host '============================================================' -ForegroundColor Green
