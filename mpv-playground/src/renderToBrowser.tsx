import "./polyfill"
import "./main.css"
import { createRender, renderNode } from "@mpv-easy/react"
import type { MPV } from "@mpv-easy/tool"
// @ts-ignore
import FontFaceObserver from "fontfaceobserver"

// biome-ignore lint/suspicious/useNamespaceKeyword: <explanation>
declare module globalThis {
  // biome-ignore lint/style/noVar: <explanation>
  var isBrowser: boolean
  // biome-ignore lint/style/noVar: <explanation>
  var mp: MPV & { renderAll: () => void }
  // biome-ignore lint/style/noVar: <explanation>
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
