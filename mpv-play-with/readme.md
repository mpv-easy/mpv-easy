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

Make sure you have already installed [yt-dlp](https://github.com/yt-dlp/yt-dlp)

- Download [mpv-easy-play-with-windows](https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-easy-play-with-windows)
- Move mpv-easy-play-with-windows to the same folder as mpv.exe
- Double-click mpv-easy-play-with-windows

## npm

```bash
npm i @mpv-easy/play-with
```

```ts
import { sendToMpv, encodeToBase64 } from '@mpv-easy/play-with';
import type { PlayItem, PlayWith } from '@mpv-easy/play-with';

const list: PlayItem[] = [
  url: 'http://hello.mp4',
  title: 'mpv-easy'
];
const playWith: PlayWith= { playlist:{ list }, start: 0 } ;

const base64 = encodeToBase64(playWith);
sendToMpv(base64);
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

```
https://www.bilibili.com/
https://www.bilibili.com/video/BVxxx
https://live.bilibili.com/xxx
```

### twitch

```
https://www.twitch.tv/xxx
https://www.twitch.tv/xxx/video/xxx
```
