//!PARAM enabled
//!DESC Whether to enable Mandelbrot rendering (0=off, 1=on)
//!TYPE DYNAMIC float
//!MINIMUM 0.0
//!MAXIMUM 1.0
0.0

//!PARAM screen_w
//!DESC Player screen width in pixels
//!TYPE DYNAMIC float
//!MINIMUM 1.0
//!MAXIMUM 7680.0
1920.0

//!PARAM screen_h
//!DESC Player screen height in pixels
//!TYPE DYNAMIC float
//!MINIMUM 1.0
//!MAXIMUM 4320.0
1080.0

//!PARAM center_re
//!DESC Center of view on real axis
//!TYPE DYNAMIC float
//!MINIMUM -100.0
//!MAXIMUM 100.0
-0.5

//!PARAM center_im
//!DESC Center of view on imaginary axis
//!TYPE DYNAMIC float
//!MINIMUM -100.0
//!MAXIMUM 100.0
0.0

//!PARAM zoom
//!DESC Zoom level
//!TYPE DYNAMIC float
//!MINIMUM 0.0
//!MAXIMUM 1000000000.0
1.0

//!PARAM max_iter
//!DESC Maximum iteration count
//!TYPE DYNAMIC float
//!MINIMUM 64.0
//!MAXIMUM 4096.0
256.0

//!HOOK OUTPUT
//!BIND HOOKED
//!DESC Render Mandelbrot fractal (Single Precision)

vec3 mandelbrotColor(float t) {
    // Force blue-ish palette
    // a + b*cos( 6.28318*(c*t+d) )
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.50, 0.50, 0.00); // Blue phase
    return a + b * cos(6.28318 * (c * t + d));
}

vec4 hook() {
    vec4 orig = HOOKED_texOff(0);

    if (enabled < 0.5) {
        return orig;
    }

    // Map pixel to complex plane
    vec2 uv = HOOKED_pos;
    float aspect = screen_w / screen_h;
    float scale = 3.0 / zoom;

    // c = complex number for this pixel
    float re = (uv.x - 0.5) * scale * aspect + center_re;
    float im = (uv.y - 0.5) * scale + center_im;

    // Mandelbrot iteration (float32)
    float zr = 0.0;
    float zi = 0.0;
    float zr2 = 0.0;
    float zi2 = 0.0;
    float iter = 0.0;

    for (float i = 0.0; i < 4096.0; i += 1.0) {
        if (i >= max_iter) break;
        if (zr2 + zi2 > 4.0) break;
        zi = 2.0 * zr * zi + im;
        zr = zr2 - zi2 + re;
        zr2 = zr * zr;
        zi2 = zi * zi;
        iter = i;
    }

    // Inside set = black
    if (zr2 + zi2 <= 4.0) {
        return vec4(0.0, 0.0, 0.0, 1.0);
    }

    // Smooth coloring
    // t moves slowly as iter increases
    float sl = iter - log2(log2(zr2 + zi2)) + 4.0;
    float t = sl / 32.0;

    vec3 col = mandelbrotColor(t);
    return vec4(col, 1.0);
}
