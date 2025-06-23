## Introduction to MPV Shaders

In this article, we'll provide a brief introduction to shaders and demonstrate how to write simple shaders for use in the MPV video player via scripting. Our final goal is to apply a mosaic (pixelation) effect when the video is paused, with tunable parameters for mosaic size and intensity. For a deeper dive into shader programming, check out the resources linked at the end.

https://github.com/user-attachments/assets/3455369e-7c4f-4ebb-964d-85a03aa9e95c

## What Is a Shader?

At its core, a shader is a high-performance program designed to manipulate the appearance of each pixel on the screen. When MPV renders a frame, it passes the color and position of every pixel to the shader, which then computes and returns a modified color to display.

### Sampling a Pixel

Most GLSL shaders define a `main` or `hook` function. In MPV, you use predefined variables like `HOOKED_raw` (the original texture) and `HOOKED_pos` (the pixel coordinate). The example below shows a shader that simply retrieves the current pixel's color and returns it unchanged:

```glsl
//!DESC My First Shader
//!HOOK MAIN
//!BIND HOOKED

vec4 hook() {
  // Sample the original color
  vec4 original_color = textureLod(HOOKED_raw, HOOKED_pos, 0.0);
  // Return the color unmodified
  return original_color;
}
```

On a 1080×720 frame, this `hook` function is called 1080×720 times—once per pixel.

### Converting to Grayscale

A simple effect is converting RGB to grayscale using the NTSC formula:

```
GRAY = 0.299 * Red + 0.587 * Green + 0.114 * Blue
```

In GLSL:

```glsl
//!DESC Grayscale Shader
//!HOOK MAIN
//!BIND HOOKED

vec4 hook() {
  // Sample the original color
  vec4 color = textureLod(HOOKED_raw, HOOKED_pos, 0.0);
  // Compute luminance
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  // Return grayscale color with original alpha
  return vec4(vec3(gray), color.a);
}
```

## Applying a Shader via Script

1. Save the shader to `~~/shaders/gray.glsl` (on Linux/macOS this resolves to `~/.config/mpv/shaders/gray.glsl`; on Windows it’s under `<MPV_DIR>/portable_config/shaders`).
2. Create a script at `~~/scripts/gray.js` (or `.lua` if you prefer):

```js
var shaderPath = "~~/shaders/gray.glsl";
mp.register_event("file-loaded", () => {
  mp.command(`change-list glsl-shaders add ${shaderPath}`);
});
```

Now, whenever you open a video in MPV, it will appear in grayscale.

![Grayscale-Shader](https://github.com/user-attachments/assets/e3bb3017-a887-4168-928a-2a9c15bb3014)

## Creating a Mosaic (Pixelation) Effect

A mosaic effect divides the frame into equally sized blocks and displays a single color per block—often the average or a sample color. Here’s a basic square mosaic that uses the top-left pixel of each block:

```glsl
//!DESC Mosaic Shader
//!HOOK MAIN
//!BIND HOOKED

// User-tunable parameters
#define MOSAIC_SIZE 64.0  // Block size in pixels
#define INTENSITY   1.0   // 0.0 (none) to 1.0 (full)

vec4 hook() {
  vec2 tex_coord = HOOKED_pos * HOOKED_size;   // Pixel coordinates

  // Calculate the mosaic block coordinates
  vec2 mosaic_coord = floor(tex_coord / MOSAIC_SIZE) * MOSAIC_SIZE;

  // Convert back to normalized texture coordinates
  // Calculates the top-left pixel coordinate of the mosaic block that the current pixel belongs to.
  vec2 mosaic_tex_coord = mosaic_coord / HOOKED_size;

  // Sample the color from the mosaic block
  vec4 mosaic_color = textureLod(HOOKED_raw, mosaic_tex_coord, 0.0);

  // Sample the original color
  vec4 original_color = textureLod(HOOKED_raw, HOOKED_pos, 0.0);

  // Mix the mosaic and original colors based on intensity
  // If INTENSITY = 0.0, the result is original_color (no mosaic).
  // If INTENSITY = 1.0, the result is mosaic_color (full mosaic).
  // If INTENSITY = 0.5, the result is a 50/50 blend of both
  vec4 final_color = mix(original_color, mosaic_color, INTENSITY);

  return final_color;
}
```

## Activating Mosaic Only on Pause

To apply the mosaic shader only when the video is paused—and remove it when playback resumes—use the `pause` property observer:

```js
var shaderPath = "~~/shaders/mosaic.glsl";
mp.observe_property("pause", "bool", (name, isPaused) => {
  var cmd = isPaused
      ? `change-list glsl-shaders add ${shaderPath}`
      : `change-list glsl-shaders remove ${shaderPath}`;
  mp.command(cmd);
});
```
![Mosaic-Shader](https://github.com/user-attachments/assets/08210df1-b551-4ede-b23e-8dfebc78745e)

## Further Resources

- [LearnOpenGL: Getting Started with Shaders](https://learnopengl.com/Getting-started/Shaders)
- [The Book of Shaders (Interactive)](https://thebookofshaders.com/edit.php)
- [MDN: GLSL Shaders for Web Applications](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shaders)
- [PTC Mathcad Example: Grayscale and Color in Images](https://support.ptc.com/help/mathcad/r10.0/en/index.html#page/PTC_Mathcad_Help/example_grayscale_and_color_in_images.html)
- [pause mosaic: mpv shader script - youtube](https://www.youtube.com/watch?v=ftvaZ-Wp9f8)
