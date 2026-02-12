import "@mpv-easy/polyfill"
import {
  command,
  setProperty,
  observeProperty,
  unobserveProperty,
  registerScriptMessage,
  osdMessage,
  info,
  verbose,
} from "@mpv-easy/tool"

const SHADER_FILE = "~~/shaders/mandelbrot/mandelbrot.glsl"

// ============ Tunable parameters ============
const ZOOM_SPEED = 1.3 // Zoom multiplier per step
const MAX_ITER = 256 // Max iterations
// =============================================

let enabled = false
let shaderLoaded = false

// View state
let centerRe = -0.5
let centerIm = 0.0
let zoom = 1.0

// Cached player state
let cachedOsdW = 1920
let cachedOsdH = 1080
let cachedMx = 960
let cachedMy = 540

function buildOpts(params: Record<string, number>): string {
  return Object.entries(params)
    .map(([key, val]) => `mandelbrot/${key}=${val}`)
    .join(",")
}

function updateParams() {
  const opts = buildOpts({
    enabled: enabled ? 1.0 : 0.0,
    screen_w: cachedOsdW,
    screen_h: cachedOsdH,
    center_re: centerRe,
    center_im: centerIm,
    zoom: zoom,
    max_iter: MAX_ITER,
  })
  setProperty("glsl-shader-opts", opts)
}

function loadShader() {
  if (shaderLoaded) return
  command(`change-list glsl-shaders append ${SHADER_FILE}`)
  shaderLoaded = true
  info("mandelbrot.ts: shader loaded")
}

function unloadShader() {
  if (!shaderLoaded) return
  command(`change-list glsl-shaders remove ${SHADER_FILE}`)
  shaderLoaded = false
  info("mandelbrot.ts: shader unloaded")
}

// Convert mouse pixel position to complex plane coordinates
function mouseToComplex(mx: number, my: number) {
  const aspect = cachedOsdW / cachedOsdH
  const scale = 3.0 / zoom
  const re = (mx / cachedOsdW - 0.5) * scale * aspect + centerRe
  const im = (my / cachedOsdH - 0.5) * scale + centerIm
  return { re, im }
}

// Zoom towards the current mouse position
function doZoom(zoomIn: boolean) {
  if (!enabled) return

  const mouse = mouseToComplex(cachedMx, cachedMy)

  if (zoomIn) {
    zoom *= ZOOM_SPEED
  } else {
    zoom /= ZOOM_SPEED
    if (zoom < 1.0) zoom = 1.0
  }

  const mouseAfter = mouseToComplex(cachedMx, cachedMy)

  centerRe += mouse.re - mouseAfter.re
  centerIm += mouse.im - mouseAfter.im

  updateParams()
  verbose(
    `mandelbrot: zoom=${zoom.toFixed(2)} center=(${centerRe.toFixed(6)}, ${centerIm.toFixed(6)})`,
  )
}

// Property observer callbacks (saved for unobserve)
const onMousePos = (_name: string, val: { x: number; y: number }) => {
  if (!val || !enabled) return
  cachedMx = val.x
  cachedMy = val.y
}

const onOsdWidth = (_name: string, val: number) => {
  if (val == null) return
  cachedOsdW = val
  if (enabled) updateParams()
}

const onOsdHeight = (_name: string, val: number) => {
  if (val == null) return
  cachedOsdH = val
  if (enabled) updateParams()
}

function startObservers() {
  observeProperty("mouse-pos", "native", onMousePos)
  observeProperty("osd-width", "number", onOsdWidth)
  observeProperty("osd-height", "number", onOsdHeight)
}

function stopObservers() {
  unobserveProperty(onMousePos as (...args: unknown[]) => void)
  unobserveProperty(onOsdWidth as (...args: unknown[]) => void)
  unobserveProperty(onOsdHeight as (...args: unknown[]) => void)
}

// Reset view
function resetView() {
  centerRe = -0.5
  centerIm = 0.0
  zoom = 1.0
}

// Toggle fractal on/off
function toggle() {
  enabled = !enabled
  if (enabled) {
    resetView()
    loadShader()
    startObservers()
    updateParams()
    osdMessage("Mandelbrot: ON", 2)
  } else {
    updateParams()
    stopObservers()
    unloadShader()
    osdMessage("Mandelbrot: OFF", 1)
  }
}

// Register script messages (keys are bound in mandelbrot.input.conf)
registerScriptMessage("mandelbrot", toggle)

registerScriptMessage("mandelbrot-zoom-in", () => {
  doZoom(true)
})

registerScriptMessage("mandelbrot-zoom-out", () => {
  doZoom(false)
})

registerScriptMessage("mandelbrot-reset", () => {
  if (!enabled) return
  resetView()
  updateParams()
  osdMessage("Mandelbrot: view reset", 1)
})

info("mandelbrot.ts: loaded")
