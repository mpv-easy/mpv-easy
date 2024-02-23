import { createRender, getRootNode, renderNode } from "@mpv-easy/ui"

let c = -1

let max = 0
let min = 1 << 20
let sum = 0

export const customRender = (reactNode: React.ReactNode) =>
  createRender({
    customRender: (node) => {
      const st = +Date.now()
      renderNode(getRootNode(), ++c, 0)
      // renderNode(getRootNode(), ++currentRenderCount, 0)
      const ed = +Date.now()
      const t = ed - st
      max = Math.max(max, t)
      min = Math.min(min, t)
      sum += t
      const every = sum / (c + 1)
      globalThis.print(["render time: ", c, min, max, every].join(" "))
    },
  })(reactNode)
