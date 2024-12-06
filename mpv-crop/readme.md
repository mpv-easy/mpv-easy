crop script for mpv

## install

You need to install [ffmpeg](https://www.ffmpeg.org/download.html) and add ffmpeg to ```PATH```

- Download the latest version of [mpv-crop.js](https://github.com/mpv-easy/mpv-easy/releases) and copy it to the mpv script directory, or use [mpsm](../mpv-mpsm/readme.md) `mpsm install mpv-crop`

- Add configuration to input.conf [shortkey](https://github.com/mpv-easy/mpv-easy/tree/main/mpv-crop#shortkey)



## usage

By default, the shortcut key `C` adds the current time point to the segment, `esc` cancels the selection, and `o` exports the video.

If the video file is `/a/b/c.mp4`, output the 10th second. Then the output image file is `/a/b/c.10.webp`

### mpv-crop

<div style="display: flex;">
  <img src="../assets/img/mpv-crop-image.webp" alt="mpv-crop-image"/>
</div>

### mpv-easy

Use mpv-cut to select the video segment, and then use mpv-crop to crop it.


## shortkey

Add configuration to input.conf

```
C         script-message crop
o         script-message output
ESC       script-message cancel
```

## config

config file: `mpv-crop.conf`


```conf
crop-event-name="crop"
output-event-name="output"
cancel-event-name="cancel"
line-color="00FF00"
mask-color="00FF00"
line-width=2
output-directory=""
crop-image-format="webp"
```