// @ts-ignore
import FontFaceObserver from "fontfaceobserver"
import { createRender, renderNode } from "@mpv-easy/ui"
// biome-ignore lint/style/useImportType: <explanation>
import React from "react"
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
    let c = -1
    createRender({
      customRender: (node) => {
        renderNode(node, ++c, 0)
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
