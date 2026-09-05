# MangoBox Releases and Downloads

User-downloadable binaries are published through **GitHub Releases** rather than stored as versioned binaries in the source tree.

## Component tags

- `mangox2-vX.Y.Z`
- `mangolite-vX.Y.Z`
- `device-manager-vX.Y.Z`
- `hardware-lab-vX.Y.Z`
- `gateway-vX.Y.Z`

## Typical release assets

Firmware releases:

- validated `.uf2`
- release notes
- SHA-256 checksums
- compatibility notes

Desktop-tool releases:

- Windows Installer when the tool provides an installed distribution
- portable Windows ZIP/package
- release notes
- SHA-256 checksums where appropriate

When Installer and Portable forms are both published for the same desktop-tool release, they should be produced from the same validated binary tree whenever the engineering build supports that contract.

## Download-page version policy / 官網版本顯示原則

The public download center should show the **current recommended version** in the main download section. The immediately previous validated version should remain available through a compact **Previous / Archive** section or its GitHub Release page, rather than competing visually with the current version.

官網下載中心的主要下載區只顯示**目前建議版本**。前一個已驗證版本不刪除，而是移至簡潔的 **Previous / Archive（歷史版本）** 區或保留於 GitHub Release 頁，避免一般使用者誤選舊版，同時保留教室回退、相容性比對與研究重現能力。

Older releases may remain on GitHub Releases unless there is a specific security, licensing, or distribution reason to remove them.

除非有安全、授權或發布政策上的特殊原因，較舊版本原則上不必從 GitHub Releases 刪除。

## Official Release Notes format / 正式 Release Notes 格式

All public MangoBox GitHub Releases should use a bilingual **Traditional Chinese + English** format. Traditional Chinese appears first, followed by English.

所有 MangoBox 對外公開的 GitHub Release Notes，原則上統一採用 **繁體中文 + English** 雙語格式，繁體中文在前、英文在後。

Recommended section order / 建議段落順序：

1. 中文
   - 版本與用途說明
   - 支援硬體／平台
   - 下載檔案
   - 安裝方式
   - Build 資訊
   - 版本狀態
2. English
   - Release purpose
   - Supported hardware/platforms
   - Downloads
   - Installation
   - Build information
   - Release status

For release-candidate versions (`rc`), mark the GitHub Release as **Pre-release** and clearly state that it is not a final stable release.

凡 `rc` 候選版本，GitHub Release 應標示為 **Pre-release**，並在中英文 Release Notes 中清楚說明尚未列為正式 Stable 版本。

Release Notes are user-facing product documentation. Keep them concise and practical; detailed engineering commit histories may remain in changelogs or development documentation.

Release Notes 屬於使用者可直接看到的產品文件，內容應簡潔、實用；詳細工程 commit 紀錄可保留於 changelog 或開發文件中，不必全部放入公開 Release Notes。

## Validation labels

Release notes should distinguish clearly between:

- Code / review PASS
- CI build/test PASS
- Hardware validation PASS

Do not label a hardware behavior as PASS unless it has been tested on representative physical hardware.
