import React, { useEffect, useState } from "react"
import {
  OsdOverlay,
  addKeyBinding,
  getAssScale,
  getOsdSize,
  setPropertyBool,
} from "@mpv-easy/tool"
import { drawRect } from "@mpv-easy/assdraw"
import { COLORS } from "e-color"

const low = 10
const high = 60
const step = 10
const count = (high - low) / step + 1
const cursorSize = 16
setPropertyBool("pause", true)
const ovlList = Array(count)
  .fill(0)
  .map(() => ({
    x: 0,
    y: 0,
    ovl: new OsdOverlay({
      hidden: false,
      computeBounds: false,
    }),
  }))

setTimeout(() => {
  for (let i = 0; i < count; i++) {
    const color = `#${Object.values(COLORS)[i].toString(16).padStart(6, "0")}`
    const scale = getAssScale()
    const ovl = ovlList[i]
    const osd = { width: 0, height: 0, ...getOsdSize() }
    const x = ovl.x + 5
    ovl.x = x
    const y = i * (osd.height / count) * scale
    const width = cursorSize
    const height = (osd.height / count) * scale
    const ass = drawRect({
      x,
      y,
      width,
      height,
      color,
    })
    ovl.ovl.data = ass
    ovl.ovl.update()
  }
}, 1000)

const moveStep = 1
addKeyBinding("space", "space", () => {
  console.log("space")
  for (let i = 0; i < count; i++) {
    const inv = i * step + low
    const osd = { width: 0, height: 0, ...getOsdSize() }
    const color = `#${Object.values(COLORS)[i].toString(16).padStart(6, "0")}`
    const ovl = ovlList[i]
    ovl.ovl.update()
    const scale = getAssScale()
    const move = moveStep * (i + 1)
    console.log("inv: ", inv, move)
    setInterval(() => {
      const x = ovl.x + move
      ovl.x = x
      const y = i * (osd.height / count) * scale
      const width = cursorSize
      const height = (osd.height / count) * scale
      const ass = drawRect({
        x,
        y,
        width,
        height,
        color,
      })
      ovl.ovl.data = ass
      ovl.ovl.update()
    }, inv)
  }
})
