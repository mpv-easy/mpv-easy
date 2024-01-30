import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

function MouseEvent() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const [hoverHide, setHoverHide] = useState(true)
  return (
    <Box
      id="main"
      position="relative"
      x={100}
      y={100}
      width={400}
      height={400}
      backgroundColor="000000"
      onMouseDown={({ x, y, offsetX, offsetY }) => {
        console.log("main: ", x, y, offsetX, offsetY)
        setPos({ x, y })
      }}
      onMouseEnter={() => {
        setHoverHide(false)
      }}
      onMouseLeave={() => {
        setHoverHide(true)
      }}
      onMouseMove={({ x, y, offsetX, offsetY }) => {
        console.log("hover-box: ", x, y, offsetX, offsetY)
        setHoverPos({ x, y })
      }}
    >
      <Box
        id="box"
        position="absolute"
        x={pos.x}
        y={pos.y}
        width={50}
        height={50}
        backgroundColor="FFFFFF"
      />

      <Box
        id="hover-box"
        position="absolute"
        hide={hoverHide}
        x={hoverPos.x}
        y={hoverPos.y}
        width={50}
        height={50}
        backgroundColor="FFFFFFC0"
      />
    </Box>
  )
}

render(<MouseEvent />)
