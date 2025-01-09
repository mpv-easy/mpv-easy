# How to Share Video Subtitles

Sharing video subtitles effectively can be challenging, especially when managing multiple subtitles. This guide explores two popular methods: stitching pictures and merging subtitles.

---

## 1. Stitching Pictures

This method involves capturing individual subtitles as separate images and stitching them into a single image.

![Stitching Pictures](../assets/blog/stitching-pictures.webp)

### **Advantages**
- **Versatility:** Works for both hard subtitles (burned into the video) and soft subtitles (separate subtitle files).
- **Flexibility:** Ideal for very long subtitles, as you can stitch together as many images as needed.

### **Disadvantages**
- **Visual Proportion Issues:** The stitched image might appear awkward due to mismatched sizes or aspect ratios of the subtitles.

### **How to Use**
1. Prepare a set of images to be stitched.
2. Use a [tool](https://vue3-caption-join-ahaoboy.vercel.app/#/) to combine these images one by one.

---

## 2. Merging Subtitles

This approach involves merging multiple subtitles into a single frame and capturing a screenshot.

![Merging Subtitles](../assets/blog/merging-subtitles.webp)

### **Advantages**
- **Simplicity:** Only one image is required, making it easy to share.
- **Cleaner Layout:** Offers a unified view of the subtitles in one frame.

### **Disadvantages**
- **Limited Space:** Challenges arise with too many subtitles:
  - Overlapping the video content.
  - Truncation of text due to screen size constraints.
  - Only supports soft subtitles.

### **How to Use**
1. Use **mpv-easy** to play the video.
2. Press the **`c` key** to select the video segment with the subtitles to merge.
3. Use **`shift + s`** to merge the subtitles from the selected segment.
4. Press the **`s` key** to take a screenshot.
5. Use **`esc`** to cancel the selection.

---

## Which Method Should You Use?

Choose the method based on your needs:
- **Stitching Pictures**: Best for flexibility and handling lengthy subtitles.
- **Merging Subtitles**: Ideal for quick, simple sharing with fewer subtitles.

