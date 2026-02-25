import "@mpv-easy/polyfill"
import { runMpvEasy } from "../src/mpv-easy"
import { DefaultFps } from "@mpv-easy/react"
import { getenv } from "@mpv-easy/tool"

const SHOW_FPS = !!getenv("SHOW_FPS")
const MAX_FPS_FRAME = getenv("MAX_FPS_FRAME")
const FRAME_LIMIT = getenv("FRAME_LIMIT")
runMpvEasy({
  fps: DefaultFps,
  showFps: SHOW_FPS,
  maxFpsFrame: MAX_FPS_FRAME ? +MAX_FPS_FRAME : 64,
  frameLimit: FRAME_LIMIT ? +FRAME_LIMIT : 0,
})
// import React from "react"
// import { ColorBoxDirty } from "./example/color-box-dirty"
// import { createRender } from "@mpv-easy/react"

// createRender({
//   showFps: true,
// })(<ColorBoxDirty />)
