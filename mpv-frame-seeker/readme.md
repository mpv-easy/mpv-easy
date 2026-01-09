# mpv-frame-seeker

A script for frame-by-frame video navigation using mouse control.


https://github.com/user-attachments/assets/fe5bb251-7179-4cc2-a761-89392f39eeef



## Usage

Activate with `Ctrl+F`:

```
CTRL+f     script-message frame-seeker
```

Once activated, other UI elements are hidden and a dial control appears. Click anywhere on the video to engage (dial turns green), then move the mouse left/right to seek backward/forward by frames.

The number below the dial shows `frame+offset`: the frame number when activated and the current offset from that frame.

## Mouse Position Behavior

The click position affects seek sensitivity:

- Click at center: moving to left edge = -60 frames, to right edge = +60 frames
- Click at 1/4 position: moving to left edge = -60 frames, to right edge = +60 frames

This allows finer control when clicking closer to screen edges.

## Configuration

`frame-seeker.conf`:

```conf
# ARGB
color="#FFFFFFFF"
activeColor="#FF00FF00"
borderSize=2
frames=120
bottom=100
radius=200
ui=yes
text=yes
font-size=24
frameSeekerEventName="frame-seeker"
```
