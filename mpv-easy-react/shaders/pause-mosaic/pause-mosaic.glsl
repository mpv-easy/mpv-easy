//!DESC Mosaic Effect
//!HOOK MAIN
//!BIND HOOKED

// User variables
#define MOSAIC_SIZE 64.0  // Size of each mosaic block (in pixels)
#define INTENSITY 1.0     // Intensity of the mosaic effect (0.0 to 1.0)

vec4 hook() {
    vec2 tex_size = HOOKED_size;              // Size of the input texture
    vec2 tex_coord = HOOKED_pos * tex_size;   // Pixel coordinates

    // Calculate the mosaic block coordinates
    vec2 mosaic_coord = floor(tex_coord / MOSAIC_SIZE) * MOSAIC_SIZE;

    // Convert back to normalized texture coordinates
    vec2 mosaic_tex_coord = mosaic_coord / tex_size;

    // Sample the color from the mosaic block
    vec4 mosaic_color = textureLod(HOOKED_raw, mosaic_tex_coord, 0.0);

    // Sample the original color
    vec4 original_color = textureLod(HOOKED_raw, HOOKED_pos, 0.0);

    // Mix the mosaic and original colors based on intensity
    vec4 final_color = mix(original_color, mosaic_color, INTENSITY);

    return final_color;
}