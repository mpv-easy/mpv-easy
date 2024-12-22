Use shortcut key(default ctrl+v) to play video from clipboard, supports file, webdav and jellyfin.


## install
You need to install [yt-dlp](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#installation) and add yt-dlp to ```PATH``` or put yt-dlp in the same directory as mpv.exe

- Download the latest version of [mpv-clipboard-play.js](https://github.com/mpv-easy/mpv-easy/releases) and copy it to the mpv script directory
- Add configuration to input.conf [shortkey](https://github.com/mpv-easy/mpv-easy/tree/main/mpv-clipboard-play#shortkey)

## Supported link formats
Folders do not support recursive scanning

- local file: c:/a/b/c.mp4
- local folder: c:/a/b
- webdav file http://<host>/a.mp4
- webdav folder: http://<host>/a
- jellyfin file http://<host>/web/index.html#!/details?id=<id>&serverId=<sid>
- jellyfin folder: http://<host>/web/index.html#!/movies.html?topParentId=<id>
- youtube: https://www.youtube.com/watch?v=<id>


## shortkey
Add configuration to `input.conf`

```
CTRL+v     script-message clipboard-play
```

## todo
- [ ] open video from clipboard