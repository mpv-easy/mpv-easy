import { Box, Tooltip, render, MouseEvent } from "@mpv-easy/ui"
import React, { useState } from "react"

const size = 400
const dark = "000000A0"
function TooltipBox() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hide, setHide] = useState(true)
  const onMouseEnter = ({ x, y }: MouseEvent) => {
    setHide(false)
    setPos({ x, y })
  }
  const onMouseMove = ({ x, y }: MouseEvent) => {
    if (!hide) {
      setPos({ x, y })
    }
  }

  const onMouseLeave = ({ x, y }: MouseEvent) => {
    setHide(true)
    setPos({ x, y })
  }

  return (
    <>
      <Box
        id="left-top"
        left={0}
        top={0}
        width={size}
        height={size}
        backgroundColor={dark}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      <Box
        id="right-top"
        right={0}
        top={0}
        width={size}
        height={size}
        backgroundColor={dark}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      <Box
        id="left-bottom"
        left={0}
        bottom={0}
        width={size}
        height={size}
        backgroundColor={dark}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      <Box
        id="right-bottom"
        right={0}
        bottom={0}
        width={size}
        height={size}
        backgroundColor={dark}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      <Tooltip
        id="tooltip-box"
        mouseX={pos.x}
        mouseY={pos.y}
        color="000000"
        backgroundColor="00FFFF"
        hide={hide}
        text={[pos.x, pos.y].join("-")}
      />
    </>
  )
}

render(<TooltipBox />)
