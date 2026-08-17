mpv-easy rust extension

## fs

### mkdir
```bash
mpv-easy-ext fs mkdir '"./a/b/c"'
```

## clipboard
### set
In order to handle special symbols such as line breaks, the base64 and json are used here
```bash
mpv-easy-ext clipboard set '"YWJjZAo="'
```

### get

```bash
echo '"breaks"' | base64

mpv-easy-ext clipboard set '"ImJyZWFrcyIK"'

mpv-easy-ext clipboard get
# "\"breaks\"\n"

```

### set-image
```bash
mpv-easy-ext clipboard set-image '"./a.png"'
```

## webdav
### list
```bash
mpv-easy-ext webdav list '"http://192.168.0.111:9421/"'
```

## fetch

```bash
mpv-easy-ext fetch '"http://127.0.0.1:5000/test.srt"'

mpv-easy-ext fetch '"http://127.0.0.1:3000"' "{\"headers\":{\"User-Agent\":\"mpv easy\"}}"
```

## jellyfin

```bash
mpv-easy-ext jellyfin userid 'server' 'api_key' 'username'

mpv-easy-ext jellyfin view 'server' 'api_key' 'username'

mpv-easy-ext jellyfin playbackinfo 'server' 'api_key' 'username' 'id'

mpv-easy-ext jellyfin playlist 'server' 'api_key' 'username' 'topParentId'

```


## play-with

play-with is a userscript + local protocol program that lets you play web videos (bilibili/youtube, etc.) in your local player (mpv/vlc/potplayer) from the browser

### install protocol

`mpv-easy-play-with` registers the `mpv-easy://` protocol on startup, via one of the following:

- Run the mpv-easy player once, the protocol is registered automatically
- Download [mpv-easy-play-with-windows.exe](https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-easy-play-with-windows.exe), copy it to the same directory as `mpv.exe`/`vlc.exe`/`PotPlayerMini64.exe` and double-click to register
- Register manually:

```bash
mpv-easy-play-with 'C:/path/to/mpv.exe'
```

### protocol format

```
mpv-easy://<payload>
vlc-easy://<payload>
pot-easy://<payload>
```

The payload is a gzip-compressed, base64-encoded PlayWith JSON:

```json
{
  "playlist": {
    "list": [
      {
        "video": {
          "title": "Video title",
          "url": "https://www.youtube.com/watch?v=xxx"
        },
        "subtitles": []
      }
    ]
  },
  "start": 0,
  "args": ["--volume=50"]
}
```

Fields:

- `playlist.list[].video.url`: video url, required
- `playlist.list[].video.title`: video title, optional, used in the m3u playlist display
- `playlist.list[].subtitles`: subtitle list, optional
- `start`: start index of the playlist, optional
- `args`: extra arguments passed to the player, optional

### protocol test

You can verify the protocol is installed by opening the test link:

```
mpv-easy://H4sIAEv3gmoAAyWLQQqCQBRAr/L568hlIESQuggiDNpEtFDnp0PjjOgfJ7GB6AxdqYt0koxWDx7vjdiobFCyYwxH/PM0Yi8FmZ+xrcIQK+amC4PAOTcfjGWb07wwdeAyLqpVv1xrnaeLJtr0e5whS1Y0XdGQU9tYfQ0hESW1VmtqO/g8XpBoIXUJh4pqgjtsieFoLMTGacgHiDMnBaRGdDIT76eZkh3xRckben/2/gtB2xXytgAAAA==
```

### chunk

When the payload exceeds 2048 characters, split it into chunks and append the current chunk id and total chunk count after the base64, separated by `?` and `&`:

```
base64?chunkId&chunkCount
```

For example `base64?0&3` means chunk 0 of 3. All chunks are merged automatically once written to the temp directory. To prevent merge order errors, it is recommended to wait 100ms after each chunk is sent.

### player detection

The handler detects the target player from the `exe_path` file name:

| File name | Player |
|---|---|
| `mpv.exe` / `mpv` | mpv |
| `vlc.exe` / `vlc` | VLC |
| `PotPlayerMini64.exe` / `PotPlayerMini64` | PotPlayer |

mpv uses `--playlist-start=N` to locate the start entry. When subtitles or bilibili urls are present, an m3u playlist file (temp dir `mpv-easy-play-with.m3u8`) is generated to keep per-item titles.

## todo
- [ ] fetch
- [ ] read and write binary files
- [ ] change mouse cursor style