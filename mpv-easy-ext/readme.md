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
```

## jellyfin

```bash
mpv-easy-ext jellyfin userid 'server' 'api_key' 'username'

mpv-easy-ext jellyfin view 'server' 'api_key' 'username'

mpv-easy-ext jellyfin playbackinfo 'server' 'api_key' 'username' 'id'

mpv-easy-ext jellyfin playlist 'server' 'api_key' 'username' 'topParentId'

```


## todo
- [ ] fetch
- [ ] read and write binary files
- [ ] change mouse cursor style