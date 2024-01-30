import { AssDraw } from "@mpv-easy/assdraw"
import { Overlay, PropertyBool, command } from "@mpv-easy/tool"
import * as ICON from "../icon"

command("set osc no")
command("set window-dragging no")

const overlay = new Overlay()
new PropertyBool("pause").observe((v) => {
  console.log("pause: ", v)
  overlay.data = new AssDraw()
    .font("FiraCode Nerd Font Mono Reg")
    .fontSize(32)
    .redText("pause: ")
    .blueText(v ? ICON.Pause : ICON.Play)
    .toString()
  overlay.update()
})
