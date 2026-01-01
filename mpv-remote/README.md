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

## Requirements

- MPV player with `--input-ipc-server` support
- `mpv-easy-remote` protocol handler registered

## Usage

1. Set the IPC server name (default: `mpv_remote_7780`)
2. Optionally enter a media path or URL
3. Click "Start MPV" to launch the player
4. Use the control panel to control playback

## Development

```bash
pnpm install
pnpm dev
```
