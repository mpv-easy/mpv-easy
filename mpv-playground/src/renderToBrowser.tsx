const canvas = document.createElement("canvas")
globalThis.mp = createMpvMock(canvas, 1920, 720, 30)
globalThis.print = console.log

import { createMpvMock } from "@mpv-easy/canvas"
import "./main.css"
import { createRender, renderNode } from "@mpv-easy/ui"
import { MPV } from "@mpv-easy/tool"
// @ts-ignore
import FontFaceObserver from "fontfaceobserver"

declare module globalThis {
  var isBrowser: boolean
  var mp: MPV & { renderAll: () => void }
  var print: (...args: any[]) => void
}

export function renderToBrowser(reactNode: React.ReactNode, fontName?: string) {
  const render = function () {
    let c = -1
    createRender({
      customRender: (node) => {
        renderNode(node, ++c, 0)
        globalThis.mp.renderAll()
      },
    })(reactNode)
  }
  if (fontName?.length) {
    const font = new FontFaceObserver(fontName)
    font.load().then(render)
  } else {
    render()
  }
}
