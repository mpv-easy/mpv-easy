import React from "react"

// @ts-ignore
import FontFaceObserver from "fontfaceobserver"
import { getRootFlex, createRender } from "@mpv-easy/ui"
import { createMpvMock } from "./mock"

export function renderToCanvas(
  dom: React.ReactNode,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  fontName?: string,
) {
  const mp = createMpvMock(canvas, width, height)
  globalThis.mp = mp

  const render = () => {
    createRender({
      customRender: () => {
        getRootFlex().rerender()
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
