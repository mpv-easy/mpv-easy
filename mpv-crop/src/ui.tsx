import React, { useRef } from "react"
import { Box, getDirection, MpDom } from "@mpv-easy/react"
import {
  existsSync,
  getDesktopDir,
  getFileName,
  getOsdSize,
  getPropertyNative,
  getPropertyNumber,
  Rect,
  VideoParams,
} from "@mpv-easy/tool"

function getLabelPos(
  node: MpDom | null,
  x: number,
  y: number,
  width: number,
  height: number,
  padding = 16,
) {
  if (!node) return { x: width, y: height }

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
  zIndex: number
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
  zIndex,
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
            zIndex={zIndex}
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
          zIndex={zIndex + 1}
        />
      )}
      {!done && (
        <Box
          position="absolute"
          left={mouseX}
          width={lineWidth}
          height={osdHeight}
          backgroundColor={lineColor}
          zIndex={zIndex + 1}
        />
      )}

      {/* label */}
      {!done && (
        <Box
          ref={labelRef}
          position="absolute"
          left={labelPos.x}
          top={labelPos.y}
          zIndex={zIndex + 2}
          text={label}
          hide={!labelRef.current}
          pointerEvents="none"
          // backgroundColor={maskColor}
          // display="flex"
          // justifyContent="center"
          // alignContent="stretch"
          // textAlign="center"
          // alignItems="center"
        />
      )}
    </Box>
  )
}

export function getCropImagePath(
  videoPath: string,
  time: number,
  imageFormat: string,
  rect: Rect,
  outputDirectory: string,
) {
  const dir = existsSync(outputDirectory) ? outputDirectory : getDesktopDir()
  const name = getFileName(videoPath)!
  const list = name.split(".")
  const ext = imageFormat || "webp"
  const prefix = list.slice(0, -1).join(".")
  const nameList = [
    prefix,
    time | 0,
    rect.x | 0,
    rect.y | 0,
    rect.width | 0,
    rect.height | 0,
    ext,
  ]
  return `${dir}/${nameList.join(".")}`
}

export function getCropRect(points: [number, number][]): Rect | undefined {
  const [[x1, y1], [x2, y2]] = points
  const top = Math.min(y1, y2)
  const left = Math.min(x1, x2)
  const bottom = Math.max(y1, y2)
  const right = Math.max(x1, x2)
  const zoom = 2 ** getPropertyNumber("video-zoom", 0)
  const osd = getOsdSize()!
  const osdRect = new Rect(0, 0, osd.width, osd.height)
  const osdCropRect = new Rect(left, top, right - left, bottom - top)
  const videoParams = getPropertyNative<VideoParams>("video-params")!
  const videoTargetParams = getPropertyNative<VideoParams>(
    "video-target-params",
  )!
  if (
    videoTargetParams.w <= osdRect.width &&
    videoTargetParams.h <= osdRect.height &&
    zoom <= 1
  ) {
    const videoScaleX = videoParams.w / videoTargetParams.w
    const videoScaleY = videoParams.h / videoTargetParams.h
    const videoTargetRect = new Rect(
      0,
      0,
      videoTargetParams.w,
      videoTargetParams.h,
    )
    const videoCenterRect = osdRect.placeCenter(videoTargetRect)
    const cropRect = videoCenterRect.intersection(osdCropRect)
    if (!cropRect) {
      return undefined
    }
    const x = (cropRect.x - videoCenterRect.x) * videoScaleX
    const y = (cropRect.y - videoCenterRect.y) * videoScaleY
    const w = cropRect.width * videoScaleX
    const h = cropRect.height * videoScaleY
    return new Rect(x, y, w, h)
  }
  const aspect = videoTargetParams.w / videoTargetParams.h
  let scaleW = videoTargetParams.w
  let scaleH = videoTargetParams.h
  if (aspect <= videoParams.aspect) {
    scaleH = videoTargetParams.w / videoParams.aspect
  } else {
    scaleW = videoTargetParams.w / videoParams.aspect
  }
  const sx = zoom * (scaleW / videoParams.w)
  const sy = zoom * (scaleH / videoParams.h)
  const videoTargetRect = new Rect(0, 0, videoParams.w * sx, videoParams.h * sy)
  const videoCenterRect = osdRect.placeCenter(videoTargetRect)
  const cropRect = videoCenterRect.intersection(osdCropRect)
  if (!cropRect) {
    return undefined
  }
  const x = (cropRect.x - videoCenterRect.x) / sx
  const y = (cropRect.y - videoCenterRect.y) / sy
  const w = cropRect.width / sx
  const h = cropRect.height / sy
  return new Rect(x, y, w, h)
}
