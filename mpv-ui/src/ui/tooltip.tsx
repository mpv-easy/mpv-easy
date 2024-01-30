import { BaseElementProps, Box, DOMElement } from "../index"
import React, { useRef } from "react"
import { getOsdSize } from "@mpv-easy/tool"

export type TooltipProps = {
  mouseX: number
  mouseY: number
}

export type TooltipDirection =
  | "left-top"
  | "left-bottom"
  | "right-top"
  | "right-bottom"
function getDirection(
  x: number,
  y: number,
  width: number,
  height: number,
): TooltipDirection {
  const halfW = width / 2
  const halfH = height / 2
  if (x < halfW) {
    if (y < halfH) {
      return "left-top"
    } else {
      return "left-bottom"
    }
  } else {
    if (y < halfH) {
      return "right-top"
    } else {
      return "right-bottom"
    }
  }
}

function computeTooltipPosition(
  node: DOMElement | null,
  mouseX: number,
  mouseY: number,
  direction: TooltipDirection,
): { x: number; y: number } {
  const pos = { x: 0, y: 0 }
  if (!node) {
    return pos
  }
  const { height, width } = node.layoutNode
  switch (direction) {
    case "left-bottom": {
      pos.x = mouseX
      pos.y = mouseY - height
      break
    }
    case "left-top": {
      pos.x = mouseX
      pos.y = mouseY
      break
    }
    case "right-bottom": {
      pos.x = mouseX - width
      pos.y = mouseY - height
      break
    }
    case "right-top": {
      pos.x = mouseX - width
      pos.y = mouseY
      break
    }
  }

  return pos
}
export function Tooltip({
  mouseX,
  mouseY,
  ...boxProps
}: Partial<BaseElementProps> & TooltipProps) {
  const osdSize = getOsdSize()
  const direction = getDirection(
    mouseX,
    mouseY,
    osdSize?.width || 0,
    osdSize?.height || 0,
  )
  const nodeRef = useRef<DOMElement>(null)
  const tipPos = computeTooltipPosition(
    nodeRef.current,
    mouseX,
    mouseY,
    direction,
  )
  return (
    <Box
      id="tooltip-box"
      {...boxProps}
      ref={nodeRef}
      position="absolute"
      x={tipPos.x}
      y={tipPos.y}
    />
  )
}
