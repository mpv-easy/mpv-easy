import { Box, render } from "@mpv-easy/ui"
import React, { useRef, useState } from "react"

const size = 200

export function MousePosBox() {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  return (
    <Box
      width={"100%"}
      height={"100%"}
      onMouseMove={({ x, y }) => {
        console.log("onMouseMove: ", x, y)
        setPos({
          x: x - size / 2,
          y: y - size / 2,
        })
      }}
    >
      <Box
        id="drag-ball"
        position="absolute"
        x={pos.x}
        y={pos.y}
        width={size}
        height={size}
        backgroundColor={"00FFFF"}
      />
    </Box>
  )
}
