# @mpv-easy/m3u-subtitles

Auto-load subtitle references from local M3U/M3U8 playlists.

## Supported formats

| Tag | Example |
|-----|---------|
| `#EXTVLCOPT:sub-file=` | `#EXTVLCOPT:sub-file=subs/en.srt` |
| `#EXT-X-MEDIA:TYPE=SUBTITLES` | `#EXT-X-MEDIA:TYPE=SUBTITLES,URI="subs/en.vtt"` |

## How it works

1. When mpv opens an `.m3u`/`.m3u8` file, the plugin scans it for subtitle hints
2. Subtitle paths are resolved relative to the playlist location
3. Before the next media entry loads, subtitles are injected via `options/sub-files`

## Install

```bash
pnpm add @mpv-easy/m3u-subtitles
```

Add to your mpv scripts configuration.
