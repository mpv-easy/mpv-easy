import { Overlay, command } from "@mpv-easy/tool"

command("set osc no")
command("set window-dragging no")

let c = 0
const counter = new Overlay()

setInterval(() => {
  counter.data = (c++).toString()
  counter.update()
}, 1000)
