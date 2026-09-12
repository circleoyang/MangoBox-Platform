param(
    [string]$MangoBoxRepo = 'D:\MangoBoxLocal\MangoBox',
    [string]$PublicRepo = 'circleoyang/MangoBox-Platform'
)

$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$tempDir = Join-Path ([IO.Path]::GetTempPath()) ('mangobox-stable-publish-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempDir | Out-Null

function Require-File([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Required file not found: $Path"
    }
}

function Get-Sha([string]$Path) {
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Assert-SidecarContains([string]$Sidecar, [string]$Hash) {
    Require-File $Sidecar
    $text = (Get-Content -LiteralPath $Sidecar -Raw).ToLowerInvariant()
    if ($text -notmatch [regex]::Escape($Hash.ToLowerInvariant())) {
        throw "SHA sidecar does not contain expected hash: $Sidecar"
    }
}

function Test-ReleaseExists([string]$Tag) {
    $probe = 'gh release view "{0}" --repo "{1}" >nul 2>nul' -f $Tag, $PublicRepo
    & $env:ComSpec /d /s /c $probe
    return ($LASTEXITCODE -eq 0)
}

function New-NotesFile([pscustomobject]$Release, [string]$HashText) {
    $path = Join-Path $tempDir ($Release.Tag + '.md')
    if ($Release.Kind -eq 'dm') {
        $body = @"
# MangoBox Device Manager v0.5.2

## 中文

Device Manager v0.5.2 是五 target 車體方向校正正式版，支援 MangoX2 + Pico / Pico W / Pico 2 W 與 MangoLite + Pico W / Pico 2 W。

### 主要更新
- 新增跨板 Motor Direction Calibration。
- 支援 `drive.left_motor`、`drive.right_motor`、`drive.left_inverted`、`drive.right_inverted`。
- Drive 設定儲存後立即生效，不需重新開機。
- 延續 MangoLite Line Tracking / Obstacle capability parity 與既有五 target 管理功能。

### 驗證
- Device Manager full regression：213 PASS。
- Portable / Installer 正式版 build：PASS。
- Windows stable visual smoke：PASS。
- 代表性 MangoX2 Motor Direction Calibration 實機 smoke：PASS。

### 下載與 SHA-256
$HashText

## English

Device Manager v0.5.2 is the stable five-target motor-direction calibration release for MangoX2 + Pico / Pico W / Pico 2 W and MangoLite + Pico W / Pico 2 W.

### Highlights
- Adds cross-board Motor Direction Calibration.
- Supports logical wheel mapping and independent per-wheel inversion.
- Drive configuration takes effect immediately after save without reboot.
- Retains existing five-target management behavior and MangoLite Line Tracking / Obstacle capability parity.

### Validation
- Full Device Manager regression: 213 PASS.
- Stable Portable / Installer build: PASS.
- Windows stable visual smoke: PASS.
- Representative MangoX2 Motor Direction Calibration hardware smoke: PASS.

### Downloads and SHA-256
$HashText
"@
    } elseif ($Release.Kind -eq 'mangox2') {
        $body = @"
# MangoX2 Runtime v0.2.8 — $($Release.TargetName)

## 中文

MangoX2 Runtime v0.2.8 將車體左右輪對應與單輪反轉設定正式納入 Drive Runtime，使不同馬達接線與車體組裝方式可透過 Device Manager 校正，而不需修改學生程式。

### 重點
- `drive.left_motor` / `drive.right_motor`
- `drive.left_inverted` / `drive.right_inverted`
- 保持既有 v0.2.7 預設方向語意相容。
- Raw M1/M2 維持實體 channel 語意；forward/backward/tank/arc/spin 使用邏輯車輪語意。
- config 更新後下一個 Drive command 即套用新 profile。

### 驗證
- Motor / Drive automated regression：PASS。
- Pico / Pico W / Pico 2 W 三 target clean local build：PASS。
- 代表性 MangoX2 車體方向校正實機 smoke：PASS。

### 下載與 SHA-256
$HashText

## English

MangoX2 Runtime v0.2.8 adds stable logical wheel mapping and independent per-wheel inversion to the Drive Runtime, allowing chassis wiring differences to be calibrated without changing learner programs.

Validation includes Motor/Drive automated regression, clean local builds for all three MangoX2 targets, and representative hardware direction-calibration smoke.

### Download and SHA-256
$HashText
"@
    } else {
        $body = @"
# MangoLite Runtime v0.6.3 — $($Release.TargetName)

## 中文

MangoLite Runtime v0.6.3 正式加入 BLE Control v1 與 Motor Direction Calibration。

### 重點
- Dabble Gamepad Digital control。
- Analog Joystick angle / radius callback。
- BLE Control Student API callback。
- Digital Car / Analog Car 範例。
- `drive.left_motor` / `drive.right_motor` 與左右輪 inversion 校正。
- BLE、UART 與既有 Runtime loop 可共存；一般啟動不主動 advertising，配對由板載 GP3 長按約 10 秒開啟。

### 驗證
- Pico W / Pico 2 W exact stable build：PASS。
- BLE Digital / Analog control、disconnect cleanup、Student API examples：已完成 RC line 實機驗證。
- Motor Direction Calibration：PASS。

### 下載與 SHA-256
$HashText

## English

MangoLite Runtime v0.6.3 is the stable BLE Control v1 and Motor Direction Calibration release.

Highlights include Dabble Digital Gamepad support, analog joystick callbacks, Student Control API, Digital/Analog Car examples, and logical wheel mapping with per-wheel inversion. BLE remains lazy at normal startup and pairing is opened by holding the onboard GP3 button for about 10 seconds.

### Download and SHA-256
$HashText
"@
    }
    [IO.File]::WriteAllText($path, $body, $utf8)
    return $path
}

$mxDir = Join-Path $MangoBoxRepo 'runtime\mangox2-pico\releases\v0.2.8'
$mlDir = Join-Path $MangoBoxRepo 'runtime\mangolite-pico2w\releases\v0.6.3'
$dmDir = Join-Path $MangoBoxRepo 'pc\device-manager\release'

$releases = @(
    [pscustomobject]@{ Kind='mangox2'; Tag='mangox2-pico-v0.2.8'; Title='MangoX2 + Pico Runtime v0.2.8'; TargetName='MangoX2 + Pico'; Files=@((Join-Path $mxDir 'MangoBox_Runtime_v0.2.8_MangoX2_Pico.uf2')) },
    [pscustomobject]@{ Kind='mangox2'; Tag='mangox2-picow-v0.2.8'; Title='MangoX2 + Pico W Runtime v0.2.8'; TargetName='MangoX2 + Pico W'; Files=@((Join-Path $mxDir 'MangoBox_Runtime_v0.2.8_MangoX2_PicoW.uf2')) },
    [pscustomobject]@{ Kind='mangox2'; Tag='mangox2-pico2w-v0.2.8'; Title='MangoX2 + Pico 2 W Runtime v0.2.8'; TargetName='MangoX2 + Pico 2 W'; Files=@((Join-Path $mxDir 'MangoBox_Runtime_v0.2.8_MangoX2_Pico2W.uf2')) },
    [pscustomobject]@{ Kind='mangolite'; Tag='mangolite-picow-v0.6.3'; Title='MangoLite + Pico W Runtime v0.6.3'; TargetName='MangoLite + Pico W'; Files=@((Join-Path $mlDir 'MangoLite_Runtime_v0.6.3_PicoW.uf2')) },
    [pscustomobject]@{ Kind='mangolite'; Tag='mangolite-pico2w-v0.6.3'; Title='MangoLite + Pico 2 W Runtime v0.6.3'; TargetName='MangoLite + Pico 2 W'; Files=@((Join-Path $mlDir 'MangoLite_Runtime_v0.6.3_Pico2W.uf2')) },
    [pscustomobject]@{ Kind='dm'; Tag='device-manager-v0.5.2'; Title='MangoBox Device Manager v0.5.2'; TargetName='Windows'; Files=@(
        (Join-Path $dmDir 'MangoBox_Device_Manager_v0.5.2_Portable.zip'),
        (Join-Path $dmDir 'MangoBox_Device_Manager_v0.5.2_Portable.zip.sha256.txt'),
        (Join-Path $dmDir 'MangoBox_Device_Manager_v0.5.2_Setup.exe'),
        (Join-Path $dmDir 'MangoBox_Device_Manager_v0.5.2_Setup.exe.sha256.txt')
    ) }
)

$null = Get-Command gh -ErrorAction Stop
& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI authentication failed.' }

Write-Host '=== Preflight local stable artifacts ==='
foreach ($release in $releases) {
    foreach ($file in $release.Files) { Require-File $file }
}

$mxSum = Join-Path $mxDir 'SHA256SUMS.txt'
$mlSum = Join-Path $mlDir 'SHA256SUMS.txt'
Require-File $mxSum
Require-File $mlSum

foreach ($release in $releases | Where-Object { $_.Kind -eq 'mangox2' }) {
    $file = $release.Files[0]
    $hash = Get-Sha $file
    Assert-SidecarContains $mxSum $hash
}
foreach ($release in $releases | Where-Object { $_.Kind -eq 'mangolite' }) {
    $file = $release.Files[0]
    $hash = Get-Sha $file
    Assert-SidecarContains $mlSum $hash
}

$dmPortable = Join-Path $dmDir 'MangoBox_Device_Manager_v0.5.2_Portable.zip'
$dmPortableSidecar = "$dmPortable.sha256.txt"
$dmInstaller = Join-Path $dmDir 'MangoBox_Device_Manager_v0.5.2_Setup.exe'
$dmInstallerSidecar = "$dmInstaller.sha256.txt"
Assert-SidecarContains $dmPortableSidecar (Get-Sha $dmPortable)
Assert-SidecarContains $dmInstallerSidecar (Get-Sha $dmInstaller)

foreach ($release in $releases) {
    if (Test-ReleaseExists $release.Tag) {
        throw "Release already exists: $($release.Tag). Refusing to overwrite public evidence."
    }
}
Write-Host '[PASS] All six release tags are unused.' -ForegroundColor Green

$createdTags = @()
foreach ($release in $releases) {
    $hashLines = @()
    foreach ($file in $release.Files) {
        if ($file.EndsWith('.sha256.txt')) { continue }
        $hashLines += ('- `{0}` — `{1}`' -f ([IO.Path]::GetFileName($file)), (Get-Sha $file))
    }
    $notes = New-NotesFile $release ($hashLines -join [Environment]::NewLine)

    $uploadFiles = @($release.Files)
    if ($release.Kind -ne 'dm') {
        $sumPath = Join-Path $tempDir ($release.Tag + '-SHA256SUMS.txt')
        $sumText = ((@($release.Files) | ForEach-Object { (Get-Sha $_) + '  ' + [IO.Path]::GetFileName($_) }) -join [Environment]::NewLine) + [Environment]::NewLine
        [IO.File]::WriteAllText($sumPath, $sumText, $utf8)
        $uploadFiles += $sumPath
    }

    Write-Host "[CREATE] $($release.Tag)"
    & gh release create $release.Tag --repo $PublicRepo --title $release.Title --notes-file $notes --target main @uploadFiles
    if ($LASTEXITCODE -ne 0) { throw "gh release create failed: $($release.Tag)" }
    $createdTags += $release.Tag
}

Write-Host '=== Verifying published releases and remote asset digests ==='
foreach ($release in $releases) {
    $json = & gh release view $release.Tag --repo $PublicRepo --json url,isDraft,isPrerelease,tagName,name,assets
    if ($LASTEXITCODE -ne 0) { throw "Release verification failed: $($release.Tag)" }
    $remote = $json | ConvertFrom-Json
    if ($remote.isDraft -or $remote.isPrerelease) { throw "Release is not stable/public: $($release.Tag)" }
    foreach ($file in $release.Files) {
        $name = [IO.Path]::GetFileName($file)
        $expected = Get-Sha $file
        $asset = @($remote.assets | Where-Object { $_.name -ceq $name })
        if ($asset.Count -ne 1) { throw "Remote asset missing/duplicate: $name" }
        if ($asset[0].digest -and $asset[0].digest -ne ('sha256:' + $expected)) {
            throw "Remote digest mismatch: $name"
        }
    }
    Write-Host "[PASS] $($release.Tag) $($remote.url)" -ForegroundColor Green
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Green
Write-Host '[PASS] Stable public publication completed' -ForegroundColor Green
Write-Host 'Published:'
$createdTags | ForEach-Object { Write-Host ('  ' + $_) }
Write-Host 'Next: update MangoBox-Platform website/download pages to point at these stable tags.'
Write-Host '============================================================' -ForegroundColor Green
