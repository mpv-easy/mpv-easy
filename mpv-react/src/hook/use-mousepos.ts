import { observeProperty } from "@mpv-easy/tool"
import { useEffect, useState } from "react"

export function useMousePos() {
  const [pos, setPos] = useState({ x: 0, y: 0, hover: false })

  useEffect(() => {
    let lastPos = pos
    const callback = (
      _: string,
      value: { x: number; y: number; hover: boolean },
    ) => {
      if (
        lastPos.x === value.x &&
        lastPos.y === value.y &&
        lastPos.hover === value.hover
      ) {
        return
      }
      lastPos = value
      setPos(value)
    }

    observeProperty("mouse-pos", "native", callback)

    return () => {
      try {
        mp.unobserve_property(callback)
      } catch (_e) {
        // Ignore errors during cleanup
      }
    }
  }, [])

  return pos
}
