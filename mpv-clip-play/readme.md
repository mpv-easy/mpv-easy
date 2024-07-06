Use shortcut key(default ctrl+v) to play video from clipboard, supports file, webdav and jellyfin.

## Supported link formats
Folders do not support recursive scanning

- local file: c:/a/b/c.mp4
- local folder: c:/a/b
- webdav file http://<host>/a.mp4
- webdav folder: http://<host>/a
- jellyfin file http://<host>/web/index.html#!/details?id=<id>&serverId=<sid>
- jellyfin folder: http://<host>/web/index.html#!/movies.html?topParentId=<id>
- youtube: https://www.youtube.com/watch?v=<id>


## config

```
key: "ctrl+v",
osdDuration: 2000
```

## todo
- [ ] open video from clipboard