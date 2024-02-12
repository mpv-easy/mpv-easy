import "./mock"
import "@mpv-easy/tool"
import React, { useEffect, useState } from "react"
import { Box, render } from "@mpv-easy/ui"
import "./main.css"
import { getMPV } from "@mpv-easy/tool"

import { createStore, Easy, getConfig } from "@mpv-easy/mpv-easy"
import { Provider } from "react-redux"

const store = createStore()

const config = getConfig()
store.getState().context = config
const canvas = getMPV().get_property_native("canvas") as HTMLCanvasElement
canvas.setAttribute("id", "mpv-canvas")
document.body.append(canvas)
render(
  <Provider store={store}>
    <Easy />
  </Provider>,
)
