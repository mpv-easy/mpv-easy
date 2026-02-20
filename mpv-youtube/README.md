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
