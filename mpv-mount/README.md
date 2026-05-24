# @mpv-easy/mount

Quickly mount local directories, M3U playlists, and WebDAV remotes via keyboard shortcuts. Supports up to 10 mount points (Ctrl+0 ~ Ctrl+9).

## Quick Start

### 1. Configure mount points

Create `portable_config/script-opts/mount.json` (or configure a custom path in `mount.conf`):

```json
[
  { "name": "local-videos", "url": "D:/videos" },
  { "name": "my-m3u", "url": "D:/playlists/favorites.m3u" },
  { "name": "nas-webdav", "url": "http://192.168.1.100:5000/", "username": "admin", "password": "123456" }
]
```

### 2. Configure mpv options

`portable_config/script-opts/mount.conf`:

```ini
# path to the JSON file (bare filename resolves to script-opts/)
mount=mount.json

# script-message event name (default: mount)
mountEventName=mount
```

### 3. Key bindings

`portable_config/input.conf`:

```
Ctrl+0     script-message mount 0
Ctrl+1     script-message mount 1
Ctrl+2     script-message mount 2
...
Ctrl+9     script-message mount 9
```

## Mount Types

### Local Directories

Mount a local folder — all playable files (video/audio/image) in the directory will be discovered automatically.

```json
{ "name": "obs-recordings", "url": "D:/obs" }
```

### M3U Playlists

Mount an [M3U](https://en.wikipedia.org/wiki/M3U) playlist file.

```json
{ "name": "favorites", "url": "D:/playlists/favorites.m3u" }
```

Example `favorites.m3u`:
```
D:\movies\a.mp4
D:\movies\b.mp4
D:\movies\c.mp4
```

### WebDAV

Supports WebDAV links with or without authentication.

**Without auth:**
```json
{ "name": "public-nas", "url": "http://192.168.1.100:5000/" }
```

**With auth:**
```json
{
  "name": "private-nas",
  "url": "http://192.168.1.100:5000/",
  "username": "admin",
  "password": "123456"
}
```

#### Alist

Make sure the user has **WebDAV read** permission in Alist:

```json
{
  "name": "alist",
  "url": "http://192.168.1.100:5244/dav",
  "username": "admin",
  "password": "admin"
}
```

#### Dufs

[Dufs](https://github.com/sigoden/dufs) does not require authentication by default. You can set credentials via `-a`:

```bash
dufs .
dufs -a dufs:dufs@/
```

```json
{
  "name": "dufs",
  "url": "http://192.168.1.100:5000/",
  "username": "dufs",
  "password": "dufs"
}
```

## API

### `resolveMountPlaylist(mount, autoloadConfig?)`

```ts
import { resolveMountPlaylist, type Mount } from "@mpv-easy/mount"

const list = await resolveMountPlaylist({
  name: "my-folder",
  url: "D:/videos",
})
// → ["D:/videos/a.mp4", "D:/videos/b.mp4", ...]
```

| Param | Type | Description |
|-------|------|-------------|
| `mount` | `Mount` | `{ name, url, username?, password? }` |
| `autoloadConfig` | `AutoloadConfig` | Media type filter (default: image+video+audio, maxSize=32) |
| **Returns** | `Promise<string[]>` | Resolved playable URLs |

### Types

```ts
type Mount = {
  url: string
  name: string
  username?: string
  password?: string
}
```

## License

MIT
