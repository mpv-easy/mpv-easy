# @mpv-easy/m3u

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

## Examples

### VLC-style M3U (`#EXTVLCOPT`)

Create a playlist file `my-videos.m3u`:

```m3u
#EXTM3U
#EXTINF:-1,Anime Opening
#EXTVLCOPT:sub-file=./subs/op.en.srt
./videos/opening.webm

#EXTINF:-1,Episode 1
#EXTVLCOPT:sub-file=./subs/ep01.en.srt
./videos/episode-01.webm

#EXTINF:-1,Episode 2
#EXTVLCOPT:sub-file=./subs/ep02.en.srt
#EXTVLCOPT:sub-file=./subs/ep02.ja.srt
./videos/episode-02.webm
```

Each entry can have one or more `#EXTVLCOPT:sub-file=` lines referencing subtitle files.
When played in mpv, subtitles are loaded automatically.

### HLS-style M3U8 (`#EXT-X-MEDIA`)

Create a master playlist `master.m3u8`:

```m3u8
#EXTM3U
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",LANGUAGE="en",URI="subs/en.vtt",DEFAULT=YES
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="中文",LANGUAGE="zh",URI="subs/zh.vtt"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="English",LANGUAGE="en",URI="audio/en.m3u8",DEFAULT=YES
#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=720x480,AUDIO="audio",SUBTITLES="subs"
video-720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2560000,RESOLUTION=1280x720,AUDIO="audio",SUBTITLES="subs"
video-1080p.m3u8
```

Only `TYPE=SUBTITLES` entries are used; `AUDIO` and other types are ignored.

