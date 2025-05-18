# Make Video Clips with mpv-easy: A Guide to Cut and Crop Features

I wanted to share a quick guide on how to use **mpv-easy** to create video clips effortlessly. If you're not familiar, mpv-easy is a user-friendly interface for the mpv media player that simplifies video editing tasks. Today, I'll focus on its **cut** and **crop** features, which are perfect for making quick video clips without needing complex software like Adobe Premiere.

---

## What is mpv-easy?

mpv-easy is an extension for mpv that adds intuitive controls for video editing directly within the player. It's especially handy for tasks like extracting specific segments or cropping parts of the video frame. Let's dive into how you can use its cut and crop functions to create video clips.

---

## Cut Feature: Extract a Time Segment

The **cut** function lets you select and extract a specific time interval from your video. Here's how it works:

- **Shortcut Key: `c`**
  - When your mouse is over the progress bar, pressing `c` adds the current mouse position as a cutting point.
  - If the mouse isn't over the progress bar, it uses the current playback position instead.
- mpv-easy keeps a queue of the **last two cutting points**. So, each time you press `c`, it updates the selection to the two most recent points.
- **Preview with `p`**: Once you've set two cutting points, press `p` to preview the selected segment. This sets an `ab-loop`, repeatedly playing the chosen interval.
- **Adjust with `esc`**: If you need to tweak your selection, press `esc` to cancel the last cutting point or exit preview mode. This is super useful for fine-tuning the second cutting point after setting the first one.
- **Output the Clip**:
  - Press `o` to save the selected segment as an **mp4** file.
  - Press `g` to save it as a **GIF**.

---

## Crop Feature: Select a Portion of the Video Frame

The **crop** function allows you to select and extract a specific area of the video frame. Here's how to use it:

- **Shortcut Key: `shift+c`**
  - This enters crop mode. Click once to start selecting a rectangular area, and click again to confirm. The non-selected area will turn into a gray transparent overlay.
  - **Why no dragging?** mpv-easy avoids mouse dragging for selection to prevent conflicts with mpv's default behavior (which uses dragging to move the player window).
- **Output the Cropped Frame**:
  - Press `o` to save the cropped area as a **WEBP** image.

---

## Using Cut and Crop Together

One of the best things about mpv-easy is that you can use **both cut and crop simultaneously**. This means you can select a specific time segment and crop a portion of the frame within that segment, all in one go. It's a simple yet powerful way to create custom video clips without needing a full-fledged video editor.

---

## Tips for Best Results

- **Cut Accuracy**: Make sure to set your cutting points precisely. Use the preview function (`p`) to check your selection before outputting.
- **Crop Precision**: When cropping, take your time to select the exact area you want. The gray overlay helps visualize what's being cropped out.
- **Combine Features**: Experiment with using cut and crop together to create exactly the clip you need.
---

Youtube video: [Make Video Clips with mpv-easy](https://www.youtube.com/watch?v=SOSLHewXJ9A)

[![Make Video Clips with mpv-easy](https://img.youtube.com/vi/SOSLHewXJ9A/maxresdefault.jpg)](https://youtu.be/SOSLHewXJ9A)
