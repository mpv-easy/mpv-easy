import { Box, render } from "@mpv-easy/ui"
import React, { useRef, useState } from "react"

const size = 200

export function DragBox() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [move, setMove] = useState(false)

  const startBallPos = useRef({ x: 0, y: 0 })
  const startMousePos = useRef({ x: 0, y: 0 })
  return (
    <Box
      width={"100%"}
      height={"100%"}
      onMouseDown={({ x, y }) => {
        console.log("onMouseDown: ", x, y, move)
        startBallPos.current = pos
        startMousePos.current = { x, y }
        setMove(true)
      }}
      onMouseUp={({ x, y }) => {
        console.log("onMouseUp: ", x, y, move)
        startBallPos.current = pos
        setMove(false)
      }}
      onMousePress={({ x, y }) => {
        console.log("onMousePress111: ", x, y, move)
        if (!move) {
          return
        }
        const dx = startMousePos.current.x - x
        const dy = startMousePos.current.y - y
        setPos({
          x: startBallPos.current.x - dx,
          y: startBallPos.current.y - dy,
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
        backgroundColor={move ? "00FFFF" : "00FF00"}
      ></Box>
    </Box>
  )
}
