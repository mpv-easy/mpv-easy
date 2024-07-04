import { createRender, renderNode } from "@mpv-easy/ui"

let max = 0
let min = 1 << 20
let sum = 0
let c = -0
export const customRender = (reactNode: React.ReactNode) =>
  createRender({
    customRender: () => {
      const st = +Date.now()
      renderNode()
      // renderNode(getRootNode(), ++c, 0)
      // renderNode(getRootNode(), ++currentRenderCount, 0)
      const ed = +Date.now()
      const t = ed - st
      max = Math.max(max, t)
      min = Math.min(min, t)
      sum += t
      const every = sum / (c + 1)
      globalThis.print(["render time: ", c++, min, max, every].join(" "))
    },
  })(reactNode)
