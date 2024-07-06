import { AssDraw, drawRect } from "@mpv-easy/assdraw"
import { OsdOverlay, getAssScale, getOsdSize } from "@mpv-easy/tool"

// TODO: mujs bug? can't use for of
const icons = "󰐑󰐐󰨖󰋚".split("")
export function MeasureText() {
  setTimeout(() => {
    let x = 0
    const size = 100
    let y = 0
    const scale = getAssScale()
    const width = getOsdSize()!.width * scale
    for (const i of icons) {
      const overlay = new OsdOverlay()
      overlay.z = 1
      const txt = new AssDraw()
        .pos(x, y)
        .fontSize(size)
        .font("JetBrainsMono NFM Regular")
        .append(i)
      overlay.data = txt.toString()
      overlay.computeBounds = true

      const rect = overlay.update()

      console.log(JSON.stringify(rect))

      const s = drawRect({ ...rect, color: "00FF00A0" })
      const rectOvl = new OsdOverlay()
      rectOvl.data = s.toString()
      rectOvl.hidden = false
      rectOvl.z = 2
      rectOvl.update()

      if (x + size > width) {
        x = 0
        y += size
      } else {
        x += size
      }
    }
  }, 1000)
}
