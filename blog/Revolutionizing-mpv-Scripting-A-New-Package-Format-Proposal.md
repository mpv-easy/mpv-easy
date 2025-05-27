# Revolutionizing mpv Scripting: A New Package Format Proposal

**Date:** Tuesday, May 27, 2025

---

## Introduction

[mpv](https://mpv.io/) is a beloved open-source media player celebrated for its robust scripting support via JavaScript and Lua. While the community boasts an impressive collection of scripts (check out [awesome-mpv](https://github.com/stax76/awesome-mpv)), the lack of an official standard has led to several pain points:

- **No Packaging for Lua:** Complex scripts with multiple files (e.g., `util.lua`) risk file conflicts when placed directly in the `scripts` directory, with some requiring specific subfolders.
- **Opaque Metadata:** Script functionality, versions, and update sources are buried in comments, making it hard to track what’s installed without diving into the code.
- **Manual Configuration:** Scripts often need tweaks in files like `input.conf` for keybindings or messages, requiring tedious manual edits post-installation.
- **Version and Dependency Chaos:** There’s no built-in way to manage versions or dependencies, complicating script maintenance.

A new [RFC](https://github.com/mpv-easy/mpv-easy/issues/124) aims to tackle these issues with a simple, flexible package format for mpv scripts. Let’s break it down.

---

## The Proposal: ZIP-Based Script Packages

The RFC introduces a standardized package format using ZIP files to bundle scripts, configurations, and resources. It’s designed to be simple enough to convert existing scripts en masse while flexible enough to support heavyweights like [uosc](https://github.com/tomasklaen/uosc) and [mpv-easy](https://github.com/mpv-easy/mpv-easy).

### Package Structure

Each ZIP package includes:

- **`script.json` (Required):** Metadata in JSON format:
  - `name`: Script name (e.g., "anime4k").
  - `download`: URL to fetch the package (required).
  - `update`: Optional URL for updates (defaults to `download`’s `script.json`).
  - Optional fields: `version`, `author`, `description`, `license` (defaults to MIT), `homepage`.

- **`main.js` or `main.lua` (Required):** The core script file. Single-file scripts are auto-renamed to this during installation.

- **Configuration Files (Optional):**
  - `input.conf`: Default keybindings or script messages.
  - `mpv.conf`: General settings.
  - Other `.conf` files (e.g., `anime4k.conf`): Script-specific configs.

- **Special Directories (Optional):**
  - `fonts/`: Fonts copied to `portable_config/fonts/`.
  - `scripts/`: Additional scripts renamed to `portable_config/scripts/<script_name>/`.
  - `externals/`: Binaries (e.g., yt-dlp) copied to mpv’s executable directory.
  - `script-opts/`: Options copied to `portable_config/script-opts/`.
  - `shaders/`: Shaders copied to `portable_config/shaders/`.

### Centralized Repository

A GitHub repo, [mpv-easy/mpv-easy-cdn](https://github.com/mpv-easy/mpv-easy-cdn), will serve as the script hub:
- **Automation:** CI converts legacy scripts to the new format.
- **Distribution:** CDNs like [jsDelivr](https://www.jsdelivr.com/) or [unpkg](https://unpkg.com/) ensure fast access and resolve CORS issues.

---

## How It Works

### Installation
- Unzip the ZIP into a designated folder (e.g., `portable_config/scripts/<script_name>`).
- Configuration files are auto-merged into mpv’s setup with comments to avoid duplicates.

### Management
- **Uninstallation:** Removes script files but keeps user-modified configs intact.
- **Updates:** The `update` URL allows lightweight version checks via `script.json`.

### Limitations
Dependency and version management (think npm-style) are sidelined for now due to complexity but could be future enhancements.

---

## Why It Matters

This format unlocks game-changing possibilities:
- **Script Store:** Imagine a site like [mpv-build](https://mpv-easy.github.io/mpv-build/) for browsing and installing scripts.
- **GUI Integration:** A hypothetical `mpv-store` script could offer in-player script management, even supporting drag-and-drop ZIP installs.
- **Community Revival:** Unmaintained gems could be modernized under [mpv-easy](https://github.com/mpv-easy/mpv-easy), adapting them to new mpv versions.

---

## Potential Concerns

- **Licensing:** MIT is recommended, but authors can choose their own via `script.json`. Legal risks remain unclear.
- **Security:** Scripts can run arbitrary code; the centralized repo can act as a safeguard by removing bad actors.
- **Binaries:** Including platform-specific binaries in `externals/` is discouraged unless essential, due to security and complexity.

---

## Conclusion

This RFC’s package format promises to streamline mpv scripting, making it easier to discover, install, and maintain scripts while supporting both simple and complex use cases. We invite the community to dive into the [RFC](https://github.com/mpv-easy/mpv-easy/issues/124), share feedback, and help shape this exciting evolution.

---
