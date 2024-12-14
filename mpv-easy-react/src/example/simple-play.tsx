import { AssDraw } from "@mpv-easy/assdraw"
import { OsdOverlay, PropertyBool, command } from "@mpv-easy/tool"
import * as ICON from "../icon"

command("set osc no")
command("set window-dragging no")

const overlay = new OsdOverlay()
new PropertyBool("pause").observe((_, v) => {
  console.log("pause: ", v)
  overlay.data = new AssDraw()
    .font("JetBrainsMono NFM Regular")
    .fontSize(32)
    .redText("pause: ")
    .blueText(v ? ICON.Pause : ICON.Play)
    .toString()
  overlay.update()
})
