# @mpv-easy/youtube

YouTube plugin for mpv-easy. It provides a visual grid of YouTube videos that you can browse and play directly within mpv.

https://github.com/user-attachments/assets/a7b266c3-89e9-4467-b043-c04978077bef

## Features

- **Visual Grid**: Displays YouTube videos with thumbnails.
- **Interactive Sidebar**: Easy access to common actions:
  - **YouTube Home**: Open YouTube in your browser.
  - **Refresh**: Fetch new recommendations.
  - **Shuffle**: Randomize the current list of videos.
  - **Pin/Unpin**: Toggle sidebar visibility.
- **Customizable Layout**: Configure the number of columns and rows.
- **Authentic Experience**: Support for `cookies.txt` to show personalized recommendations.

## Requirements

- **yt-dlp**: Used to fetch recommendation data.
- **ffmpeg**: Used for thumbnail processing.
- **curl**: Used for downloading thumbnails.
- **Cookies File**: Required for personalized recommendations. **Note: Without cookies, the plugin cannot fetch YouTube recommendation data.**
  - **How to export**: Use a browser extension like [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/ccmgnabdoocebeocplebhdeidnecontext) to export your YouTube cookies in **Netscape** format. Save the file as `cookies.txt`. For more details, see [this guide](https://www.reddit.com/r/youtubedl/comments/1l9lmyk/comment/mxyzwin/).
  - The plugin automatically searches for `cookies.txt` or `cookie.txt` in:
    - The directory containing `mpv.exe`.
    - The directory containing the `yt-dlp` executable.
- **Fonts**: Download [FiraCode Nerd Font](https://www.nerdfonts.com/font-downloads) and add `FiraCodeNerdFontMono-Regular.ttf` to the `portable_config/fonts` directory. **This is required for Nerd Font icon support used in the UI.**

## Installation

### Automatic Installation

1. Open the [mpv-easy-youtube Build Page](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22thumbfast%5C%22%2C%5C%22mpv-easy-youtube%5C%22%2C%5C%22mpv-easy-firacode%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5C%22ffmpeg%5C%22%2C%5C%22yt-dlp%5C%22%5D%2C%5C%22ui%5C%22%3A%5C%22uosc%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%7B%5C%22user%5C%22%3A%5C%22ahaoboy%5C%22%2C%5C%22repo%5C%22%3A%5C%22mpv-firacode%5C%22%7D%5D%7D%7D%22).
2. Download `mpv-uosc.zip` directly from the link and extract it.
3. Place your `cookies.txt` into the directory containing `mpv.exe`.

### Manual Installation

1. Use the link provided above to download `portable_config.zip`.
2. Extract the contents and move all files into your mpv configuration directory.
3. Ensure that necessary files like `yt-dlp`, `ffmpeg`, and `cookies.txt` are located in the same folder as the `mpv.exe` executable or available in your system path.

## Configuration

You can customize the plugin via `script-opts/mpv-easy-youtube.conf`:

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `cols` | number | Number of columns in the grid | `4` |
| `rows` | number | Number of total rows to display | `4` |
| `cookies-path` | string | Path to your YouTube `cookies.txt` | (empty) |
| `sidebar-width` | number | Width of the sidebar in pixels | `64` |
| `sidebar-pinned` | boolean | Whether to always show the sidebar | `no` |
| `title-font-size` | number | Font size for video titles | `24` |
| `title-font` | string | Font family for titles | `FiraCode Nerd Font Mono` |

## Usage

1. Open the recommendation UI with the registered script message `youtube`.
2. Use the mouse wheel to scroll through rows.
3. Click on a video card to play it.
4. Use the sidebar buttons to refresh or shuffle the list.
