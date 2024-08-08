import React from "react"

// @ts-ignore
import FontFaceObserver from "fontfaceobserver"
import { getRootFlex } from "@mpv-easy/flex"
import { createRender } from "@mpv-easy/react"

import { createMpvMock } from "./mock"

export function renderToCanvas(
  dom: React.ReactNode,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  fontName?: string,
) {
  const mp = createMpvMock(canvas, width, height)

  // @ts-ignore
  globalThis.mp = mp

  const render = () => {
    createRender({
      customRender: () => {
        getRootFlex().renderRoot()
        // renderNode(node, ++c, 0)
        mp.renderAll()
      },
    })(dom)
  }
  if (fontName?.length) {
    const font = new FontFaceObserver(fontName)
    font.load().then(render)
  } else {
    render()
  }
}
