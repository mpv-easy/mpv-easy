# mpv-remote

A web-based remote control for MPV media player using IPC (Inter-Process Communication).

## Features

- Start MPV with a media file, folder, URL, or in idle mode
- Playback controls: play, pause, stop
- Seek forward/backward (10s, 60s)
- Volume adjustment with mute toggle
- Playback speed presets (0.5x - 2x)
- Playlist and chapter navigation
- Fullscreen and OSD toggle
- Subtitle and audio track cycling

## Quick Start (Windows)

1. Download [mpv-easy-remote-windows.exe](https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-easy-remote-windows.exe)
2. Move it to the same directory as `mpv.exe`
3. Double-click `mpv-easy-remote-windows.exe` to register the `mpv-remote://` protocol (first run only)
4. Open https://mpv-easy.github.io/mpv-remote in your browser
5. Enter a local file path or YouTube URL (requires yt-dlp configured)
6. Click "Start MPV" and control playback from the web interface

## Features

## Development

```bash
pnpm install
pnpm dev
```
