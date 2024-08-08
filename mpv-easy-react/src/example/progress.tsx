import { getPropertyNumber, setPropertyNumber } from "@mpv-easy/tool"
import { Box } from "@mpv-easy/react"
import React, { useState } from "react"

const cursorSize = 100
const cursorHoverWidth = 100
export function Progress() {
  const [left, setLeft] = useState(0)
  const [leftHover, setLeftHover] = useState(0)
  return (
    <Box
      id="bar"
      position="relative"
      width={"100%"}
      height={100}
      bottom={0}
      fontSize={100}
      backgroundColor="FF0000"
      onMouseDown={(e) => {
        const w = e.target?.layoutNode.width || 0
        const per = (e.offsetX - cursorSize / 2) / w
        setLeft(per)
        const duration = getPropertyNumber("duration")!
        const time = duration * per
        setPropertyNumber("time-pos", time)
      }}
      onMouseMove={(e) => {
        const w = e.target?.layoutNode.width || 0
        const per = (e.offsetX - cursorHoverWidth / 2) / w
        setLeftHover(per)
      }}
    >
      <Box
        position="relative"
        left={0}
        top={0}
        color="FFFFFF"
        text={left.toFixed(2)}
      />
      <Box
        id="cursor"
        position="relative"
        width={cursorSize}
        left={`${left * 100}%`}
        height={100}
        backgroundColor="00FF00"
      />
      <Box
        id="hover-cursor"
        position="relative"
        width={cursorHoverWidth}
        left={`${leftHover * 100}%`}
        height={100}
        backgroundColor="0000FF"
      >
        <Box
          text={leftHover.toFixed(2)}
          position="absolute"
          top={"-100%"}
          left={"-50%"}
          backgroundColor="000000"
        />
      </Box>
    </Box>
  )
}
