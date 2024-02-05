import { ThumbFast } from "@mpv-easy/thumbfast"
import {
  PropertyBool,
  command,
  commandNative,
  commandNativeAsync,
  getPropertyNumber,
  getPropertyString,
  observeProperty,
  print,
  setPropertyNumber,
} from "@mpv-easy/tool"
import { Box, DOMElement, render } from "@mpv-easy/ui"
import React, { useEffect, useState, useRef, useLayoutEffect } from "react"

command("set osc no")
command("set window-dragging no")

const cursorWidth = 100
const cursorHoverWidth = 100
const serverId = "mpv_easy_test_001"
const thumbFormat = "bgra"
const thumbId = 42
const thumbPath = `./thumb?.${thumbFormat}`

let thumb: ThumbFast
export function Progress() {
  const [left, setLeft] = useState(0)
  const [leftHover, setLeftHover] = useState(0)
  const [hoverHide, setHoverHide] = useState(true)
  const hoverCursorRef = useRef<DOMElement>(null)
  if (!thumb) {
    thumb = new ThumbFast()
  }
  // useLayoutEffect(() => {
  // }, [])

  let thumbX = 0
  let thumbY = 0
  if (hoverCursorRef.current) {
    const { x, y, height, width } = hoverCursorRef.current.layoutNode
    thumbX = x + width / 2 - thumb?.thumbWidth / 2
    thumbY = y - thumb?.thumbHeight
  }
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
        const w = e.target.layoutNode.width
        const per = e.offsetX / w
        const left = (e.offsetX - cursorWidth / 2) / w
        setLeft(left)
        const duration = getPropertyNumber("duration")!
        const time = duration * per
        setPropertyNumber("time-pos", time)
      }}
      onMouseEnter={() => {
        setHoverHide(false)
      }}
      onMouseLeave={() => {
        setHoverHide(true)
      }}
      onMouseMove={(e) => {
        setHoverHide(false)
        const w = e.target.layoutNode.width
        const leftHover = (e.offsetX - cursorHoverWidth / 2) / w
        const duration = getPropertyNumber("duration")!
        const time = (duration * e.offsetX) / w
        thumb?.seek(time)
        setLeftHover(leftHover)
      }}
    >
      <Box
        position="relative"
        left={0}
        top={0}
        color="FFFFFF"
        text={left.toFixed(2)}
      ></Box>
      <Box
        id="cursor"
        position="relative"
        width={cursorWidth}
        left={`${left * 100}%`}
        height={100}
        backgroundColor="00FF00"
      />
      <Box
        ref={hoverCursorRef}
        id="hover-cursor"
        position="relative"
        width={cursorHoverWidth}
        left={`${leftHover * 100}%`}
        height={100}
        backgroundColor="0000FF"
        hide={hoverHide || !hoverCursorRef.current}
      >
        <Box
          x={thumbX}
          y={thumbY}
          id={thumbId}
          width={thumb?.thumbWidth}
          height={thumb?.thumbHeight}
          display="flex"
          position="relative"
          backgroundImageFormat={thumb?.format}
          backgroundImage={thumb?.path + "?ts=" + Date.now()}
        ></Box>
      </Box>
    </Box>
  )
}
render(<Progress />)
