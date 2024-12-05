cut videos script for mpv

## install

You need to install [ffmpeg](https://www.ffmpeg.org/download.html) and add ffmpeg to ```PATH```

- Download the latest version of [mpv-cut.js](https://github.com/mpv-easy/mpv-easy/releases) and copy it to the mpv script directory, or use [mpsm](../mpv-mpsm/readme.md) `mpsm install mpv-cut`

- Add configuration to input.conf [shortkey](https://github.com/mpv-easy/mpv-easy/tree/main/mpv-cut#shortkey)


## usage

By default, the shortcut key `c` adds the current time point to the segment, `esc` cancels the selection, and `o` exports the video.

### mpv-cut

mpv-cut will display the currently selected video segment in the video

<div style="display: flex;">
  <img src="../assets/img/mpv-cut-text.webp" alt="mpv-cut"/>
</div>

### mpv-easy

When the mouse is in the progress bar area, add the current mouse position to the segment, otherwise add the current time to the segmen, progress bar uses green to display the selected area by default

<div style="display: flex;">
  <img src="../assets/img/mpv-easy-cut-area.webp" alt="mpv-easy-cut"/>
</div>


## shortkey


Add configuration to input.conf

```
c         script-message cut
o         script-message cut-output
esc       script-message cancel
```