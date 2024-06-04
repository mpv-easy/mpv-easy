import throttle from "lodash-es/throttle"
import debounce from "lodash-es/debounce"
import { PropertyNative, type MousePos } from "@mpv-easy/tool"

const time = 500
const mousePosProp = new PropertyNative<MousePos>("mouse-pos")
const cb = throttle(
  (v) => {
    console.log("mouse pos: ", v.x, v.y, v.hover)
  },
  time,
  { leading: true, trailing: true },
)

mousePosProp.observe(
  cb,
  (a, b) => a.x === b.x && a.y === b.y && a.hover === b.hover,
)
