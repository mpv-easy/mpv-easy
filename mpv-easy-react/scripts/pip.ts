// https://github.com/WatanabeChika/mpv-PiP

import "@mpv-easy/polyfill"
import {
  getPropertyBool,
  getPropertyNumber,
  setPropertyBool,
  setPropertyNumber,
  observeProperty,
  registerEvent,
  addKeyBinding,
  osdMessage,
} from "@mpv-easy/tool"

// Picture-in-Picture (PiP) mode for mpv
// Original by Wanakachi, rewritten in TypeScript
// Usage: "Alt+p" to toggle PiP mode on/off

let pipEnabled = false

interface OriginalOptions {
  fullscreen?: boolean
  border?: boolean
  ontop?: boolean
  windowScale?: number
}

const originalOptions: OriginalOptions = {}

// Save original window properties
function saveOriginalOptions() {
  originalOptions.fullscreen = getPropertyBool("fullscreen")
  originalOptions.border = getPropertyBool("border")
  originalOptions.ontop = getPropertyBool("ontop")
  originalOptions.windowScale = getPropertyNumber("window-scale")
}

// Restore original window properties
function restoreOriginalOptions() {
  if (originalOptions.fullscreen !== undefined) {
    setPropertyBool("fullscreen", originalOptions.fullscreen)
  }
  if (originalOptions.border !== undefined) {
    setPropertyBool("border", originalOptions.border)
  }
  if (originalOptions.ontop !== undefined) {
    setPropertyBool("ontop", originalOptions.ontop)
  }
  if (originalOptions.windowScale !== undefined) {
    setPropertyNumber("window-scale", originalOptions.windowScale)
  }
}

// Enter PiP mode
function enablePip() {
  if (pipEnabled) return

  saveOriginalOptions()

  setPropertyBool("fullscreen", false) // exit fullscreen if necessary
  setPropertyBool("border", false) // remove decorations
  setPropertyBool("ontop", true) // keep above other windows
  setPropertyNumber("window-scale", 0.3) // scale down (30%)

  pipEnabled = true
  osdMessage("PiP enabled")
}

// Leave PiP mode
function disablePip() {
  if (!pipEnabled) return

  restoreOriginalOptions()
  pipEnabled = false
  osdMessage("PiP disabled")
}

// Toggle PiP on/off
function togglePip() {
  if (pipEnabled) {
    disablePip()
  } else {
    enablePip()
  }
}

// Re-apply PiP settings when a new file loads
registerEvent("file-loaded", () => {
  if (pipEnabled) {
    setTimeout(enablePip, 0.1) // re-apply PiP
  }
})

// Fix possible unwanted borderless state (e.g. saving PiP state by "watchlater")
setTimeout(() => {
  if (!pipEnabled && getPropertyBool("border") === false) {
    setPropertyBool("border", true)
    setPropertyBool("ontop", false)
  }
}, 0.1)

// Monitor fullscreen state changes and exit PiP first
observeProperty("fullscreen", "bool", (_name, value) => {
  if (value && pipEnabled) {
    disablePip()
    setPropertyBool("fullscreen", true)
  }
})

// Monitor window-maximized state changes (on some systems maximize and fullscreen are separate)
observeProperty("window-maximized", "bool", (_name, value) => {
  if (value && pipEnabled) {
    disablePip()
    setPropertyBool("window-maximized", true)
  }
})

// Key binding
addKeyBinding("Alt+p", "toggle-pip", togglePip)
