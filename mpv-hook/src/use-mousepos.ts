import { MousePos, observeProperty } from "@mpv-easy/tool"
import { useState } from "react"

export function useMousePos() {
  const [pos, setPos] = useState({ x: 0, y: 0, hover: false })
  let lastPos = pos
  observeProperty<"native", MousePos>("mouse-pos", "native", (_, value) => {
    if (
      lastPos.x === value.x &&
      lastPos.y === value.y &&
      lastPos.hover === value.hover
    ) {
      return
    }
    lastPos = value
    setPos(value)
  })

  return pos
}
