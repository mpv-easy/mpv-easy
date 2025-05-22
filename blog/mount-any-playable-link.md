# mount any playable link

mpv-easy now supports mounting playable links, such as webdav, local folders, m3u playlists, etc.

You can add data in JSON format to the `mount` field in the `portable_config/scripts/mpv-easy-config/mpv-easy.config.json` file. Please make sure that the added data complies with the JSON specification, there is no comma in the last object in the array, and the string uses double quotes, etc.

## webdav

Supports webdav links with and without authentication

```json
{
  "name": "dufs",
  "url": "http://192.168.0.111:5000/"
}

```

```json
{
  "name": "dufs",
  "url": "http://192.168.0.111:5000/",
  "username": "dufs",
  "password": "dufs"
}

```

### alist

Please make sure that the user has read permission(Webdav read) for webdav in alist

```json
{
  "name": "alist",
  "url": "http://192.168.0.111:5244/dav",
  "username": "admin",
  "password": "admin"
}
```

### dufs

dufs does not require authentication by default. You can set the username and password through -a. For details, refer to the [dufs documentation](https://github.com/sigoden/dufs?tab=readme-ov-file#cli)


```bash
dufs .

dufs -a dufs:dufs@/
```


## local folders

Mount local folders

```json
{
  "name": "obs",
  "url": "D:/obs"
}
```

## m3u

[m3u](https://en.wikipedia.org/wiki/M3U)  is a computer file format for a multimedia playlist that can also be mounted

```json
{
  "name": "m3u",
  "url": "D:/videos/test.m3u"
}
```

test.m3u
```
D:\videos\a.mp4
D:\videos\b.mp4
D:\videos\c.mp4
```