import "./mock"
import "@mpv-easy/tool"
import React, { useState } from "react"
import { Box, createRender, renderNode, dispatchEvent } from "@mpv-easy/ui"
import "./main.css"
import { getMPV } from "@mpv-easy/tool"

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Box
        text="dec"
        color="0000FF"
        width={100}
        height={100}
        backgroundColor={count % 2 ? "00FFFF" : "FF0000"}
        onMouseDown={() => {
          console.log("count: ", count)
          setCount((c) => c - 1)
        }}
      ></Box>
      <Box
        width={100}
        height={100}
        backgroundColor={count % 2 ? "00FFFF" : "00FF00"}
        text={count.toString()}
      />
      <Box
        text="inc"
        color="0000FF"
        width={100}
        height={100}
        onMouseDown={() => {
          console.log("count: ", count)
          setCount((c) => c + 1)
        }}
      ></Box>
    </>
  )
}

const canvas = getMPV().get_property_native("canvas") as HTMLCanvasElement
canvas.setAttribute("id", "mpv-canvas")
document.body.append(canvas)
const ctx = canvas.getContext("2d")!

let c = -1
const render = createRender({
  customRender: (node) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // TODO: hack
    setTimeout(() => {
      renderNode(node, ++c, 0)
    })
  },
})
render(<Counter />)
