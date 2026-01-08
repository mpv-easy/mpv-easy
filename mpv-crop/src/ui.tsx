import React, { useEffect, useRef } from "react"
import { Box, Button, getDirection, MpDom, useProperty } from "@mpv-easy/react"
import {
  existsSync,
  getDesktopDir,
  getFileName,
  getOsdSize,
  getProperty,
  getPropertyNative,
  getPropertyNumber,
  getSafeName,
  isRemote,
  Rect,
} from "@mpv-easy/tool"

function getLabelPos(
  node: MpDom | null,
  mouseX: number,
  mouseY: number,
  osdWidth: number,
  osdHeight: number,
  points: [number, number][],
  select: Rect | undefined,
  padding = 16,
) {
  if (!node) return { x: osdWidth, y: osdHeight }

  if (points.length === 0) {
    const d = getDirection(mouseX, mouseY, osdWidth, osdHeight)
    switch (d) {
      case "left-bottom": {
        return {
          x: mouseX + padding,
          y: mouseY - node.layoutNode.height - padding,
        }
      }
      case "left-top": {
        return { x: mouseX + padding, y: mouseY + padding }
      }
      case "right-top": {
        return {
          x: mouseX - node.layoutNode.width - padding,
          y: mouseY + padding,
        }
      }
      case "right-bottom": {
        return {
          x: mouseX - node.layoutNode.width - padding,
          y: mouseY - node.layoutNode.height - padding,
        }
      }
    }
  }

  const rect =
    select ??
    Rect.fromCoord({
      x0: mouseX,
      y0: mouseY,
      x1: points[0][0],
      y1: points[0][1],
    })

  const top = rect.y
  const bottom = osdHeight - rect.y - rect.height
  const left = rect.x
  const right = osdWidth - rect.x - rect.width

  if (top >= node.layoutNode.height + padding) {
    return {
      x: rect.x,
      y: rect.y - node.layoutNode.height - padding,
    }
  }
  if (bottom >= node.layoutNode.height + padding) {
    return {
      x: rect.x,
      y: rect.y + rect.height + padding,
    }
  }
  if (left >= node.layoutNode.width + padding) {
    return {
      x: rect.x - node.layoutNode.width - padding,
      y: rect.y,
    }
  }
  if (right >= node.layoutNode.width + padding) {
    return {
      x: rect.x + rect.width + padding,
      y: rect.y,
    }
  }

  return {
    x: rect.x,
    y: rect.y,
  }
}

export type CropProps = {
  mouseX: number
  mouseY: number
  lineWidth: number
  lineColor: string
  lineColorHover: string
  osdWidth: number
  osdHeight: number
  points: [number, number][]
  maskColor: string
  zIndex: number
  labelFontSize: number
  onChange: (points: [number, number][]) => void
}

function getMask(
  points: [number, number][],
  width: number,
  height: number,
  lineWidth: number,
  mouseX: number,
  mouseY: number,
): { mask: Rect[]; select?: Rect; edge: Rect[]; vertex: Rect[] } {
  if (points.length === 0) {
    return {
      edge: [],
      select: undefined,
      mask: [new Rect(0, 0, width, height)],
      vertex: [],
    }
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

  const select =
    points.length === 1
      ? undefined
      : new Rect(left, top, right - left, bottom - top)
  const edge: Rect[] = []
  const vertex: Rect[] = []
  const lw = lineWidth + 2 * lineWidth
  if (select) {
    edge.push(
      // left
      new Rect(
        select.x - lineWidth,
        select.y - lineWidth,
        lineWidth,
        select.height + lineWidth,
      ),

      // top
      new Rect(
        select.x - lineWidth,
        select.y - lineWidth,
        select.width + lineWidth,
        lineWidth,
      ),

      // right
      new Rect(
        right - lineWidth,
        top - lineWidth,
        lineWidth,
        select.height + lineWidth,
      ),

      // bottom
      new Rect(
        left - lineWidth,
        bottom - lineWidth,
        select.width + lineWidth,
        lineWidth,
      ),
    )

    vertex.push(
      // left-top
      new Rect(select.x - lineWidth, select.y - lineWidth, lw, lw),

      // right-top
      new Rect(
        select.x + select.width - lineWidth,
        select.y - lineWidth,
        lw,
        lw,
      ),

      // left-bottom
      new Rect(
        select.x - lineWidth,
        select.y + select.height - lineWidth,
        lw,
        lw,
      ),

      // right-bottom
      new Rect(
        select.x + select.width - lineWidth,
        select.y + select.height - lineWidth,
        lw,
        lw,
      ),
    )
  }

  return {
    mask: [topRect, leftRect, rightRect, bottomRect],
    select,
    edge,
    vertex,
  }
}

function getLabelText(
  points: [number, number][],
  mouseX: number,
  mouseY: number,
  select: Rect | undefined,
) {
  if (points.length === 0) {
    return `${mouseX | 0},${mouseY | 0}`
  }
  const { x, y, width, height } =
    select ??
    Rect.fromCoord({
      x0: mouseX,
      y0: mouseY,
      x1: points[0][0],
      y1: points[0][1],
    })
  return `${x | 0},${y | 0} ${width}x${height}`
}

export function Crop({
  mouseX,
  mouseY,
  lineWidth,
  lineColor,
  lineColorHover,
  osdHeight,
  osdWidth,
  maskColor,
  points,
  zIndex,
  labelFontSize,
  onChange,
}: CropProps) {
  const labelRef = useRef<MpDom | null>(null)

  const done = points.length === 2
  const { mask, select, edge, vertex } = getMask(
    points,
    osdWidth,
    osdHeight,
    lineWidth,
    mouseX,
    mouseY,
  )
  const labelPos = getLabelPos(
    labelRef.current,
    mouseX,
    mouseY,
    osdWidth,
    osdHeight,
    points,
    select,
    labelFontSize / 4,
  )
  const label = getLabelText(points, mouseX, mouseY, select)

  const mousePos = useProperty("mouse-pos")[0]
  const prevMousePos = useRef(mousePos)
  const prevPoints = useRef(points)
  const selectMoving = useRef(false)
  const edgeMoving = useRef(false)
  const edgeIndex = useRef(0)
  const vertexMoving = useRef(false)
  const vertexIndex = useRef(0)
  const getPointSelect = (): [number, number][] => {
    const dx = mousePos.x - prevMousePos.current.x
    const dy = mousePos.y - prevMousePos.current.y
    return prevPoints.current.map((i) => [i[0] + dx, i[1] + dy])
  }
  const getPointEdge = (index: number): [number, number][] => {
    const dx = mousePos.x - prevMousePos.current.x
    const dy = mousePos.y - prevMousePos.current.y

    const x0 = prevPoints.current[0][0]
    const y0 = prevPoints.current[0][1]
    const x1 = prevPoints.current[1][0]
    const y1 = prevPoints.current[1][1]

    let r = Rect.fromCoord({ x0, y0, x1, y1 })

    switch (index) {
      case 0: {
        // left
        r = Rect.fromCoord({
          x0: x0 + dx,
          y0,
          x1,
          y1,
        })
        break
      }
      case 1: {
        // top
        r = Rect.fromCoord({
          x0,
          y0: y0 + dy,
          x1,
          y1,
        })
        break
      }
      case 2: {
        // right
        r = Rect.fromCoord({
          x0,
          y0,
          x1: x1 + dx,
          y1,
        })
        break
      }
      case 3: {
        // bottom
        r = Rect.fromCoord({
          x0,
          y0,
          x1,
          y1: y1 + dy,
        })
        break
      }
      default: {
        console.log(`crop: getPointEdge wrong index ${index}`)
      }
    }
    return [
      [r.x0, r.y0],
      [r.x1, r.y1],
    ]
  }
  const getPointVertex = (index: number): [number, number][] => {
    const dx = mousePos.x - prevMousePos.current.x
    const dy = mousePos.y - prevMousePos.current.y

    const x0 = prevPoints.current[0][0]
    const y0 = prevPoints.current[0][1]
    const x1 = prevPoints.current[1][0]
    const y1 = prevPoints.current[1][1]

    let r = Rect.fromCoord({
      x0,
      y0,
      x1,
      y1,
    })
    switch (index) {
      case 0: {
        // left-top
        r = Rect.fromCoord({
          x0: x0 + dx,
          y0: y0 + dy,
          x1,
          y1,
        })
        break
      }
      case 1: {
        // right-top
        r = Rect.fromCoord({
          x0: x1 + dx,
          y0: y0 + dy,
          x1: x0,
          y1: y1,
        })
        break
      }
      case 2: {
        // left-bottom
        r = Rect.fromCoord({
          x0: x0 + dx,
          y0: y1 + dy,
          x1: x1,
          y1: y0,
        })
        break
      }
      case 3: {
        // right-bottom
        r = Rect.fromCoord({
          x0,
          y0,
          x1: x1 + dx,
          y1: y1 + dy,
        })
        break
      }
      default: {
        console.log(`crop: getPointVertex wrong index ${index}`)
      }
    }
    return [
      [r.x0, r.y0],
      [r.x1, r.y1],
    ]
  }
  useEffect(() => {
    if (selectMoving.current) {
      onChange(getPointSelect())
      return
    }
    if (edgeMoving.current) {
      onChange(getPointEdge(edgeIndex.current))
      return
    }
    if (vertexMoving.current) {
      onChange(getPointVertex(vertexIndex.current))
      return
    }
  }, [mousePos.x, mousePos.y])

  return (
    <Box position="absolute" width={osdWidth} height={osdHeight}>
      {/* mask */}
      {mask.map((v, k) => (
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
      ))}

      {select && (
        <Box
          top={select.y}
          left={select.x}
          position="absolute"
          width={select.width}
          height={select.height}
          zIndex={zIndex}
          onMouseDown={(e) => {
            e.stopPropagation()
            if (edgeMoving.current || vertexMoving.current) {
              return
            }
            if (selectMoving.current) {
              selectMoving.current = false
              // onChange(getPointSelect())
            } else {
              selectMoving.current = true
              prevMousePos.current = mousePos
              prevPoints.current = points
            }
          }}
        />
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
      <Box
        ref={labelRef}
        position="absolute"
        left={labelPos.x}
        top={labelPos.y}
        zIndex={zIndex + 2}
        text={label}
        hide={!labelRef.current}
        pointerEvents="none"
        fontSize={labelFontSize}
        // backgroundColor={maskColor}
        // display="flex"
        // justifyContent="center"
        // alignContent="stretch"
        // textAlign="center"
        // alignItems="center"
      />

      {/* edge */}
      {edge.length > 0 &&
        edge.map((r, k) => (
          <Button
            key={k}
            position="absolute"
            left={r.x}
            top={r.y}
            width={r.width}
            height={r.height}
            backgroundColor={lineColor}
            backgroundColorHover={lineColorHover}
            padding={lineWidth}
            zIndex={zIndex + 3}
            onMouseDown={(e) => {
              e.stopPropagation()
              if (selectMoving.current || vertexMoving.current) {
                return
              }
              if (edgeMoving.current) {
                edgeMoving.current = false
              } else {
                edgeIndex.current = k
                edgeMoving.current = true
                prevMousePos.current = mousePos
                prevPoints.current = points
              }
            }}
          />
        ))}

      {/* vertex */}
      {vertex.length > 0 &&
        vertex.map((r, k) => (
          <Button
            key={k}
            position="absolute"
            left={r.x}
            top={r.y}
            width={r.width}
            height={r.height}
            backgroundColor={lineColor}
            backgroundColorHover={lineColorHover}
            zIndex={zIndex + 4}
            onMouseDown={(e) => {
              e.stopPropagation()
              if (selectMoving.current || edgeMoving.current) {
                return
              }
              if (vertexMoving.current) {
                vertexMoving.current = false
              } else {
                vertexIndex.current = k
                vertexMoving.current = true
                prevMousePos.current = mousePos
                prevPoints.current = points
              }
            }}
          />
        ))}
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
  const unsafeName = isRemote(videoPath)
    ? getProperty("force-media-title", getFileName(videoPath)!)
    : getFileName(videoPath)!
  const name = getSafeName(unsafeName)
  const list = name.split(".")
  const ext = imageFormat || "webp"
  const prefix = list.slice(0, list.length === 1 ? 1 : -1).join(".")
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
  const videoParams = getPropertyNative("video-params")!
  const videoTargetParams = getPropertyNative("video-target-params")!
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
