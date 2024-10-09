import { Box } from "../index"
import React, { useEffect, useRef, useState } from "react"
import { getOsdSize, type MousePos, PropertyNative } from "@mpv-easy/tool"
import isEqual from "lodash-es/isEqual"
import throttle from "lodash-es/throttle"
import { getRootNode } from "../flex"
import type { MpDom, MpDomProps } from "../flex"
import { getAttribute } from "@mpv-easy/flex"

export type TooltipProps = {
  tooltipThrottle: number
}

export type TooltipDirection =
  | "left-top"
  | "left-bottom"
  | "right-top"
  | "right-bottom"
export function getDirection(
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
    }
    return "left-bottom"
  }
  if (y < halfH) {
    return "right-top"
  }
  return "right-bottom"
}

export function computeTooltipPosition(
  node: MpDom | null,
  mouseX: number,
  mouseY: number,
  direction: TooltipDirection,
): { x: number; y: number } {
  const { width: W = 0, height: H = 0 } = getOsdSize() || {}
  const pos = { x: 0, y: 0 }
  if (!node) {
    return pos
  }
  const { height, width } = node.layoutNode
  if (!W && !H) {
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
  } else {
    switch (direction) {
      case "left-bottom": {
        if (mouseX >= width / 2) {
          pos.x = mouseX - width / 2
        } else {
          pos.x = 0
        }
        pos.y = mouseY - height
        break
      }
      case "left-top": {
        if (mouseX >= width / 2) {
          pos.x = mouseX - width / 2
        } else {
          pos.x = 0
        }
        pos.y = mouseY
        break
      }
      case "right-bottom": {
        if (W - mouseX >= width / 2) {
          pos.x = mouseX - width / 2
        } else {
          pos.x = W - width
        }
        pos.y = mouseY - height
        break
      }
      case "right-top": {
        if (W - mouseX >= width / 2) {
          pos.x = mouseX - width / 2
        } else {
          pos.x = W - width
        }
        pos.y = mouseY
        break
      }
    }
  }

  return pos
}

function getTooltipElement(
  node: MpDom,
  x: number,
  y: number,
): MpDom | undefined {
  if (getAttribute(node, "hide")) {
    return
  }
  for (const c of node.childNodes) {
    const el = getTooltipElement(c, x, y)
    if (el) {
      return el
    }
  }

  if (node.layoutNode.hasPoint(x, y)) {
    if (node.attributes.title?.length) {
      return node
    }
  }
}
const mousePosProp = new PropertyNative<MousePos>("mouse-pos")

export const Tooltip = ({
  tooltipThrottle = 100,
  ...boxProps
}: Partial<TooltipProps & MpDomProps>) => {
  const [show, setShow] = useState(true)
  const [text, setText] = useState("")
  const mousePos = mousePosProp.value
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>(
    mousePos,
  )
  const tooltipRef = useRef<MpDom>(null)

  useEffect(() => {
    let lastPos = mousePos
    const update = throttle((pos) => {
      lastPos = pos
      const { x, y, hover } = pos
      if (!hover) {
        setShow(false)
        return
      }

      const target = getTooltipElement(getRootNode(), x, y)

      if (!target) {
        setShow(false)
        return
      }

      const title = target?.attributes.title
      if (title?.length) {
        const direction = getDirection(
          x,
          y,
          getRootNode().layoutNode.width,
          getRootNode().layoutNode.height,
        )
        const pos = computeTooltipPosition(tooltipRef.current, x, y, direction)
        setTooltipPos(pos)
        setShow(true)
        setText(title)
      } else {
        setShow(false)
      }
    }, tooltipThrottle)
    mousePosProp.observe(update, isEqual)
  }, [])

  return (
    <Box
      id="tooltip"
      {...boxProps}
      hide={!tooltipRef.current || boxProps.hide || !show}
      ref={tooltipRef}
      x={tooltipPos.x}
      y={tooltipPos.y}
      text={text}
      position="absolute"
    />
  )
}
