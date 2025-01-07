import throttle from "lodash-es/throttle"
import { PropertyNative } from "@mpv-easy/tool"

const time = 500
const mousePosProp = new PropertyNative("mouse-pos")
const cb = throttle((_, v) => {
  console.log("mouse pos: ", v.x, v.y, v.hover)
}, time)

mousePosProp.observe(
  cb,
  (a, b) => a.x === b.x && a.y === b.y && a.hover === b.hover,
)
