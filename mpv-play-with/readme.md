## mpv-play-with
tampermonkey script for using local mpv player to play web videos, which requires local support for ```mpv-easy://``` protocol

If you use mpv-easy, you only need to start mpv once, and mpv-easy will automatically register the ```mpv-easy://``` protocol

Inspired by https://github.com/LuckyPuppy514/Play-With-MPV

## install
You need to install the [tampermonkey](https://www.tampermonkey.net/) extension first

Then install script [mpv-easy-play-with.user.js](https://github.com/mpv-easy/mpv-easy/releases/download/v0.1.11-aplha.1/mpv-easy-play-with.user.js)



## type
A playable video corresponds to the following structure
```ts
export type PlayItem = {
  url: string
  title: string
  args: string[]
}
```

Encode a set of video information in base64 and pass it to the player
Since the URL length is limited to 2048, zip compression is used to support more videos.
```ts
export function getMpvUrl(playList: PlayItem[]): string {
  const jsonStr = JSON.stringify(playList)
  const zipBuf = gzipSync(strToU8(jsonStr))
  const base64 = encode(zipBuf)
  return `mpv-easy://${base64}`
}
```


## custom protocol

```cmd
regedit.exe /S ./mpv-easy.reg
```

```
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_CLASSES_ROOT\mpv-easy]
@="mpv-easy"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\mpv-easy\DefaultIcon]
@=""

[HKEY_CLASSES_ROOT\mpv-easy\shell]
@=""

[HKEY_CLASSES_ROOT\mpv-easy\shell\open]
@=""

[HKEY_CLASSES_ROOT\mpv-easy\shell\open\command]
@="c:\\your\\mpv-easy-play-with-windows c:\\your\\mpv.exe %1"
```