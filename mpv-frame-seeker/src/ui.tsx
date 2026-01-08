import React from "react"
import { Box } from "@mpv-easy/react"
import { AssDraw, C } from "@mpv-easy/assdraw"
import { commandv, getPropertyNumber, osdMessage } from "@mpv-easy/tool"

export function getOffset(
  width: number,
  start: number,
  current: number,
): number {
  if (width <= 0) return 0

  if (current <= start) {
    if (start <= 0) return -1

    const ratio = (current - start) / start // [-1, 0]
    return ratio
  }

  const rightWidth = width - start
  if (rightWidth <= 0) return 1

  const ratio = (current - start) / rightWidth // [0, 1]
  return ratio
}

export type FrameProps = {
  top: number
  left: number
  color: string
  radius: number
  offset: number
  zIndex: number
  borderSize: number
}

type DrawConfig = {
  left: number
  top: number
  radius: number
  borderSize: number
  degree: number
  color: string
}

export function getFPS(): number {
  return getPropertyNumber("estimated-vf-fps", 0)
}

export function getFrame(fps: number): number {
  const pos = getPropertyNumber("time-pos", 0)
  if (fps <= 0) return 0
  return Math.floor(pos * fps + 0.5)
}

export function seekFrame(target: number, fps: number): void {
  if (fps <= 0) {
    osdMessage("Error: Cannot determine framerate")
    return
  }
  const timestamp = target / fps
  commandv("seek", timestamp, "absolute+exact")
}

function drawPointer({
  left = 0,
  top = 0,
  radius = 0,
  color = "FFFFFF",
  borderSize = 2,
  degree = 0,
}: Partial<DrawConfig>) {
  const pointerAss = new AssDraw()
    .an(7)
    .pos(left, top)
    .frz(degree)
    .borderSize(0)
    .color(color)
    .drawStart()
    .moveTo(0, 0)
    .lineTo(radius, 0)
    .lineTo(radius, borderSize)
    .lineTo(0, borderSize)
    .drawStop()
    .toString()
  return pointerAss
}

function drawCircle({
  left = 0,
  top = 0,
  radius = 0,
  borderSize = 2,
  color = "FFFFFF",
}: Partial<DrawConfig>) {
  const ctrl = radius * C
  const circleAss = new AssDraw()
    .pos(left, top)
    .drawStart()
    .borderColor(color)
    .borderSize(borderSize)
    .append("{\\1a&HFF&}")
    .moveTo(radius, 0)
    .bezierCurve(radius, -ctrl, ctrl, -radius, 0, -radius)
    .bezierCurve(-ctrl, -radius, -radius, -ctrl, -radius, 0)
    .lineTo(radius, 0)
    .end()
    .toString()
  return circleAss
}

export function Frame({
  top,
  left,
  color,
  radius,
  offset,
  zIndex,
  borderSize,
}: FrameProps) {
  const degree = 360 - (offset * 90 + 270)
  const circleAss = drawCircle({
    left,
    top,
    radius,
    color,
    borderSize,
  })
  const pointerAss = drawPointer({
    left,
    top,
    radius,
    degree,
    color,
    borderSize,
  })
  return (
    <Box
      width={radius * 2}
      height={radius}
      position="absolute"
      top={top}
      left={left}
      zIndex={zIndex}
    >
      <Box
        draw={circleAss}
        position="absolute"
        top={top}
        left={left}
        width={radius * 2}
        height={radius}
      ></Box>
      <Box
        draw={pointerAss}
        position="absolute"
        top={top}
        left={left}
        width={radius * 2}
        height={radius}
      ></Box>
    </Box>
  )
}
