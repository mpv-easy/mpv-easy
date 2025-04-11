## mpv-play-with

tampermonkey script for using local mpv player to play web videos, which requires local support for `mpv-easy://` protocol

If you use mpv-easy, you only need to start mpv once, and mpv-easy will automatically register the `mpv-easy://` protocol

Inspired by https://github.com/LuckyPuppy514/Play-With-MPV

## install tampermonkey script

You need to install the [tampermonkey](https://www.tampermonkey.net/) extension first

**note**
Enable dev mode https://www.tampermonkey.net/faq.php#Q209

Then install script [mpv-easy-play-with.user.js](https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-easy-play-with.user.js)

When play-with detects videos in the page, you can add all videos to the mpv player through the mpv icon in the bottom left corner

## install yt-dlp
You need to make sure that mpv has been configured correctly [yt-dlp](https://github.com/yt-dlp/yt-dlp)
You can execute the following powershell command in the folder where mpv.exe is located to test whether youtube videos can be played
```powershell
.\mpv.exe --log-file=a.log 'https://www.youtube.com/watch?v=BnnbP7pCIvQ'
```

## install protocol by mpv-easy

You only need to run the mpv player once, and mpv-easy will automatically register the protocol.

## manual install protocol

Make sure you have already installed [yt-dlp](https://github.com/yt-dlp/yt-dlp)

- Download [mpv-easy-play-with-windows.exe](https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-easy-play-with-windows.exe)
- Copy `mpv-easy-play-with-windows.exe` to the same folder as `mpv.exe`
- Double-click `mpv-easy-play-with-windows.exe`

## protocol test

You can test whether the protocol is installed successfully by opening the test link
```
mpv-easy://H4sIAIYBvmYAAyXLQQqCQBSA4as83jp0GQgRpC6CCIM2ES3UeenQOCP6xmkwITpDV+oinSSh1b/5vxFblXsle8ZoxH/PI9pOYYQ1c9tHYeicC7yxbAsKStOELueyXg+rjdZFtmzj7XDABbJkRbOKfUFda/UtglRU1Fmtqevh+3xDqoXUFRxraggesCOGk7GQGKeh8JDkTgrIjOhlLj4vMy974quSd5wu0/QDJfFha6wAAAA=
```


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


## VLC

https://www.videolan.org/

### install

Copy `mpv-easy-play-with-windows.exe` to the same directory as `vlc.exe` and double-click `mpv-easy-play-with-windows.exe`

```
C:/Program Files/VideoLAN/VLC:


├── README.txt
├── mpv-easy-play-with-windows.exe
├── uninstall.exe
├── vlc.exe
```

## potplayer

https://potplayer.daum.net/

### install

Copy `mpv-easy-play-with-windows.exe` to the same directory as `PotPlayerMini64.exe` and double-click `mpv-easy-play-with-windows.exe`

```
C:/Program Files/DAUM/PotPlayer

├── License.txt
├── mpv-easy-play-with-windows.exe
├── PotPlayer64.dll
├── PotPlayerMini64.exe
```

## switch icon

When the mouse hovers over the icon, you can use the mouse wheel to switch icons, and clicking the corresponding icon will open the corresponding player

## lock icon

If you are only using one player, you can click the mouse right button on the icon to lock/unlock the icon. The lock will be cleared when you reset it using the `ctrl+shift+r` shortcut key.


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
