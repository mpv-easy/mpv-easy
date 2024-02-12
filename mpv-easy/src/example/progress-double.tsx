import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import {
  PropertyBool,
  command,
  getPropertyNumber,
  observeProperty,
  setPropertyNumber,
} from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

command("set osc no")
command("set window-dragging no")

const cursorSize = 100
const cursorHoverWidth = 100
function Progress({
  id,
  width,
  height,
  backgroundColor,
}: {
  id: string
  width: string
  height: string
  backgroundColor: string
}) {
  const [left, setLeft] = useState(0)
  const [leftHover, setLeftHover] = useState(0)
  return (
    <Box
      id={id}
      position="relative"
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      display="flex"
      flexDirection="column"
      justifyContent="start"
      alignItems="center"
      onMouseDown={(e) => {
        const w = e.target.layoutNode.width
        const per = (e.offsetX - cursorSize / 2) / w
        setLeft(per)
        const duration = getPropertyNumber("duration")!
        const time = duration * per
        setPropertyNumber("time-pos", time)
      }}
      onMouseMove={(e) => {
        const w = e.target.layoutNode.width
        const per = (e.offsetX - cursorHoverWidth / 2) / w
        setLeftHover(per)
      }}
    >
      <Box
        position="relative"
        color="FFFFFF"
        fontSize={100}
        text={left.toFixed(2)}
        display="flex"
        height={"100%"}
        justifyContent="start"
        alignItems="center"
      ></Box>
      <Box
        id={id + "-cursor"}
        position="relative"
        width={cursorSize}
        left={`${left * 100}%`}
        height={"100%"}
        backgroundColor="00FF00"
      />
      <Box
        id={id + "-hover-cursor"}
        position="relative"
        width={cursorHoverWidth}
        left={`${leftHover * 100}%`}
        height={"100%"}
        backgroundColor="0000FF"
      />
    </Box>
  )
}
export function ProgressDouble() {
  return (
    <Box
      id="main"
      position="relative"
      width={"100%"}
      height={"20%"}
      bottom={0}
      display="flex"
      flexDirection="row"
      justifyContent="end"
      alignItems="center"
      backgroundColor="0000FFA0"
    >
      <Progress
        id="progress1"
        width="100%"
        height={"45%"}
        backgroundColor="0FFFFF"
      />
      <Progress
        id="progress2"
        width="100%"
        height={"45%"}
        backgroundColor="0FFFFF"
      />
    </Box>
  )
}
