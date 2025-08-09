import "./polyfill"
import "./main.css"
import { createRender, renderNode } from "@mpv-easy/react"
import type { MP } from "@mpv-easy/tool"
// @ts-ignore
import FontFaceObserver from "fontfaceobserver"

declare namespace globalThis {
  var isBrowser: boolean

  var mp: MP & { renderAll: () => void }

  var print: (...args: any[]) => void
}

export function renderToBrowser(reactNode: React.ReactNode, fontName?: string) {
  const render = () => {
    createRender({
      customRender: () => {
        renderNode()
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
