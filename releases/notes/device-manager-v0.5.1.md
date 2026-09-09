# MangoBox Device Manager v0.5.1

## 中文

Device Manager v0.5.1 是 v0.5 系列的維護與架構整理正式版，延續 MangoX2 / MangoLite 五個正式 Runtime target 的支援。

### 主要更新

- 修正 MangoLite Ultrasonic 已在 Pin Configuration 啟用後，左側裝置頁未顯示的問題。
- 補齊 MangoLite + Pico W / Pico 2 W Ultrasonic capability parity。
- 將 capability / navigation 判定收斂到 canonical resolver，降低多層 visibility override 對載入順序的依賴。
- MangoX2 / MangoLite OLED 統一依 Enable 狀態顯示硬體頁；Disable 後隱藏，重新 Enable 後恢復。
- 維持 MangoLite onboard IR / Motor / RGB / Input，以及 MangoX2 既有 capability 相容性。
- 新增穩定 Windows AppUserModelID `MangoBox.DeviceManager`，修正工作列釘選後重新排列可能恢復預設圖示的問題。

### 驗證

- Local automated capability/navigation regression: PASS
- MangoLite + Pico W hardware smoke: PASS
- MangoX2 hardware smoke: PASS
- OLED enable / disable visibility hardware smoke: PASS
- Portable exact-artifact smoke: PASS
- Installer exact-artifact smoke: PASS
- Windows taskbar pin / reorder icon smoke: PASS

### Windows 下載

一般使用者建議使用 Installer；Portable ZIP 適合免安裝與教室部署。

- `MangoBox_Device_Manager_v0.5.1_Setup.exe`
  - SHA-256: `70b45ea75fc0f5e8d4f206fc54bddc79ee450b4fbb2e22b420be5d1bd1fd9484`
- `MangoBox_Device_Manager_v0.5.1_Portable.zip`
  - SHA-256: `df40a9602546a655e69b3416b56738fa3a69807ccda4b58e731bb4f62b32ab9e`

Installer 與 Portable 來自同一份已驗證的 PyInstaller binary tree。

## English

Device Manager v0.5.1 is a stable maintenance and architecture-cleanup release in the v0.5 line. It continues support for the five stable MangoX2 / MangoLite Runtime targets.

### Highlights

- Fixes the MangoLite Ultrasonic page not appearing after the module is enabled in Pin Configuration.
- Aligns Ultrasonic capability parity for MangoLite + Pico W / Pico 2 W.
- Consolidates capability/navigation ownership around the canonical resolver and reduces dependency on layered visibility overrides.
- Aligns MangoX2 / MangoLite OLED page visibility with the current Enable state: disabling hides the hardware page and re-enabling restores it.
- Preserves existing MangoLite onboard IR / Motor / RGB / Input and MangoX2 capability behavior.
- Adds the stable Windows AppUserModelID `MangoBox.DeviceManager` to keep the application icon consistent after taskbar pinning and reordering.

### Validation

- Local automated capability/navigation regression: PASS
- MangoLite + Pico W hardware smoke: PASS
- MangoX2 hardware smoke: PASS
- OLED enable / disable visibility hardware smoke: PASS
- Portable exact-artifact smoke: PASS
- Installer exact-artifact smoke: PASS
- Windows taskbar pin / reorder icon smoke: PASS

### Windows downloads

The Installer is recommended for normal Windows users. The Portable ZIP is provided for no-install and classroom deployment scenarios.

- `MangoBox_Device_Manager_v0.5.1_Setup.exe`
  - SHA-256: `70b45ea75fc0f5e8d4f206fc54bddc79ee450b4fbb2e22b420be5d1bd1fd9484`
- `MangoBox_Device_Manager_v0.5.1_Portable.zip`
  - SHA-256: `df40a9602546a655e69b3416b56738fa3a69807ccda4b58e731bb4f62b32ab9e`

Installer and Portable were produced from the same validated PyInstaller binary tree.
