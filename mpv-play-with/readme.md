## mpv-play-with

tampermonkey script for using local mpv player to play web videos, which requires local support for `mpv-easy://` protocol

If you use mpv-easy, you only need to start mpv once, and mpv-easy will automatically register the `mpv-easy://` protocol

Inspired by https://github.com/LuckyPuppy514/Play-With-MPV

## install

You need to install the [tampermonkey](https://www.tampermonkey.net/) extension first

Then install script [mpv-easy-play-with.user.js](https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-easy-play-with.user.js)

When play-with detects videos in the page, you can add all videos to the mpv player through the mpv icon in the bottom left corner

## install protocol

### mpv-easy

You only need to run the mpv player once, and mpv-easy will automatically register the protocol.

## manual steps

- download [play-with](https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-easy-play-with-windows)
- create file play-with.reg and double click to run it. NOTE: Replace the path with yours and make sure to use Windows-style path separators.

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
@="C:\\path\\to\\mpv-easy-play-with-windows C:\\path\\to\\mpv.exe %1"
```

## npm

```bash
npm i @mpv-easy/play-with
```

```ts
import { sendToMpv, encodeToBase64 } from '@mpv-easy/play-with';
import type { PlayItem, PlayList } from '@mpv-easy/play-with';

const items: PlayItem[] = [
  url: 'http://hello.mp4',
  title: 'mpv-easy'
];
const playList: PlayList = { items, start: 0 } ;

const base64 = encodeToBase64(list);
sendToMpv(base64);
```

## type

A playable video corresponds to the following structure

```ts
export type PlayItem = {
  url: string;
  title: string;
  args: string[];
};
```

Encode a set of video information in base64 and pass it to the player
Since the URL length is limited to 2048, zip compression is used to support more videos.

```ts
export function getMpvUrl(playList: PlayList): string {
  const jsonStr = JSON.stringify(playList);
  const zipBuf = gzipSync(strToU8(jsonStr));
  const base64 = encode(zipBuf);
  return `mpv-easy://${base64}`;
}
```

## chunk

When the data length exceeds 2048, you can use chunks to pass the data. You only need to concatenate the current chunk id and the total number of chunks after base64.
To prevent errors in the order of chunk merging, it is recommended to wait 100ms after each chunk is sent to allow the program enough time to write the file.

```
base64?chunkId&chunkCount
```

## short key

### ctrl+shift+r

reset icon position to bottom left

## rules

### youtube

```
https://www.youtube.com/
https://www.youtube.com/watch?v=xxx
https://www.youtube.com/watch?v=xxx&list=xxx
https://www.youtube.com/@xxx
https://www.youtube.com/@xxx/videos
```

### jellyfin

```
host/web/index.html#!/movies.html?topParentId=xxx
host/web/index.html#!/details?id=xxx&serverId=xxx
host/web/index.html#!/video
```

### bilibili

todo

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
