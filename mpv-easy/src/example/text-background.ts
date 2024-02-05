import { drawRect } from "@mpv-easy/assdraw"
import { OsdOverlay } from "@mpv-easy/tool"
import { defaultName } from "../main"

const ovl = new OsdOverlay({
  data: `{\\pos(100,100)}{\\fn${defaultName}}{\\fs64}{\\3c000000&}{\\bord0}{\\c&FFFFFF&}EFG`,
  computeBounds: true,
})
const rect = ovl.update()

const rectOvl = new OsdOverlay({
  data: drawRect({
    ...rect,
    color: "000000C0",
  }),
})

rectOvl.update()
