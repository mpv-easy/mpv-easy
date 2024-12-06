import React, { useRef } from "react"
import { Box, getDirection, MpDom } from "@mpv-easy/react"
import { dirname, existsSync, getFileName, Rect } from "@mpv-easy/tool"

function getLabelPos(
  node: MpDom | null,
  x: number,
  y: number,
  width: number,
  height: number,
  padding = 16,
) {
  if (!node) return { x: 0, y: 0 }

  const d = getDirection(x, y, width, height)

  switch (d) {
    case "left-bottom": {
      return { x: x + padding, y: y - node.layoutNode.height - padding }
    }
    case "left-top": {
      return { x: x + padding, y: y + padding }
    }
    case "right-top": {
      return { x: x - node.layoutNode.width - padding, y: y + padding }
    }
    case "right-bottom": {
      return {
        x: x - node.layoutNode.width - padding,
        y: y - node.layoutNode.height - padding,
      }
    }
  }
}

type CropProps = {
  mouseX: number
  mouseY: number
  lineWidth: number
  lineColor: string
  osdWidth: number
  osdHeight: number
  points: [number, number][]
  maskColor: string
}

function getMask(
  points: [number, number][],
  width: number,
  height: number,
  lineWidth: number,
  mouseX: number,
  mouseY: number,
): Rect[] {
  if (points.length === 0) {
    return [new Rect(0, 0, width, height)]
  }
  const [[x1, y1]] = points
  let x2 = x1
  let y2 = y1
  if (points.length === 1) {
    x2 = mouseX
    y2 = mouseY
  }

  if (points.length === 2) {
    x2 = points[1][0]
    y2 = points[1][1]
  }

  const top = Math.min(y1, y2)
  const left = Math.min(x1, x2)
  const bottom = Math.max(y1, y2)
  const right = Math.max(x1, x2)

  const topRect = new Rect(0, 0, width, top)
  const leftRect = new Rect(0, top, left, bottom - top)
  const rightRect = new Rect(right, top, width, bottom - top)
  const bottomRect = new Rect(0, bottom, width, height)
  return [topRect, leftRect, rightRect, bottomRect]
}

function getLabelText(
  points: [number, number][],
  mouseX: number,
  mouseY: number,
) {
  if (points.length === 0) {
    return `${mouseX | 0},${mouseY | 0}`
  }
  const [[x1, y1]] = points
  let x2 = x1
  let y2 = y1
  if (points.length === 1) {
    x2 = mouseX
    y2 = mouseY
  }

  if (points.length === 2) {
    x2 = points[1][0]
    y2 = points[1][1]
  }

  const w = Math.abs(x2 - x1) | 0
  const h = Math.abs(y2 - y1) | 0

  return `${mouseX | 0},${mouseY | 0} ${w}x${h}`
}

export function Crop({
  mouseX,
  mouseY,
  lineWidth,
  lineColor,
  osdHeight,
  osdWidth,
  maskColor,
  points,
}: CropProps) {
  const labelRef = useRef<MpDom | null>(null)
  const labelPos = getLabelPos(
    labelRef.current,
    mouseX,
    mouseY,
    osdWidth,
    osdHeight,
  )

  const label = getLabelText(points, mouseX, mouseY)

  const done = points.length === 2

  return (
    <Box position="absolute" width={osdWidth} height={osdHeight}>
      {/* mask */}
      {getMask(points, osdWidth, osdHeight, lineWidth, mouseX, mouseY).map(
        (v, k) => (
          <Box
            key={k}
            top={v.y}
            left={v.x}
            position="absolute"
            pointerEvents="none"
            backgroundColor={maskColor}
            width={v.width}
            height={v.height}
          />
        ),
      )}

      {/* line */}
      {!done && (
        <Box
          position="absolute"
          top={mouseY}
          width={osdWidth}
          height={lineWidth}
          backgroundColor={lineColor}
        />
      )}
      {!done && (
        <Box
          position="absolute"
          left={mouseX}
          width={lineWidth}
          height={osdHeight}
          backgroundColor={lineColor}
        />
      )}

      {/* label */}
      {!done && (
        <Box
          ref={labelRef}
          position="absolute"
          left={labelPos.x}
          top={labelPos.y}
          text={label}
        />
      )}
    </Box>
  )
}

export function getCropImagePath(
  videoPath: string,
  time: number,
  imageFormat: string,
  outputDirectory: string,
) {
  const dir = existsSync(outputDirectory) ? outputDirectory : dirname(videoPath)
  const name = getFileName(videoPath)!
  const list = name.split(".")
  const prefix = list.slice(0, -1).join(".")
  return `${dir}/${prefix}.${time | 0}.${imageFormat || "webp"}`
}

export function getCropRect(points: [number, number][]): Rect {
  const [[x1, y1], [x2, y2]] = points
  const top = Math.min(y1, y2)
  const left = Math.min(x1, x2)
  const bottom = Math.max(y1, y2)
  const right = Math.max(x1, x2)
  return new Rect(left, top, right - left, bottom - top)
}
