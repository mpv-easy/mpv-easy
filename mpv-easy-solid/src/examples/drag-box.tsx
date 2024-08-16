import { Box } from "@mpv-easy/solid"
import { command } from "@mpv-easy/tool"
import { createSignal } from "solid-js"

const size = 200
command("set window-dragging no")

export function DragBox() {
  const [pos, setPos] = createSignal({ x: 0, y: 0 })
  const [move, setMove] = createSignal(false)
  let startBallPos = { x: 0, y: 0 }
  let startMousePos = { x: 0, y: 0 }

  return (
    <Box
      width={"100%"}
      height={"100%"}
      onMouseDown={({ x, y }) => {
        console.log("onMouseDown: ", x, y, move())
        startBallPos = pos()
        startMousePos = { x, y }
        setMove(true)
      }}
      onMouseUp={({ x, y }) => {
        console.log("onMouseUp: ", x, y, move())
        startBallPos = pos()
        setMove(false)
      }}
      onMousePress={({ x, y }) => {
        console.log("onMousePress: ", x, y, move())
        if (!move()) {
          return
        }
        const dx = startMousePos.x - x
        const dy = startMousePos.y - y
        setPos({
          x: startBallPos.x - dx,
          y: startBallPos.y - dy,
        })
      }}
    >
      <Box
        id="drag-ball"
        position="absolute"
        x={pos().x}
        y={pos().y}
        width={size}
        height={size}
        backgroundColor={move() ? "#00FFFF" : "#00FF00"}
      />
    </Box>
  )
}
