import "@mpv-easy/polyfill"
import { runMpvEasy } from "../src/mpv-easy"
import { DefaultFps } from "@mpv-easy/react"
runMpvEasy({
  fps: DefaultFps,
  // showFps: true,
})
// import React from "react"
// import { ColorBoxDirty } from "./example/color-box-dirty"
// import { createRender } from "@mpv-easy/react"

// createRender({
//   showFps: true,
// })(<ColorBoxDirty />)
