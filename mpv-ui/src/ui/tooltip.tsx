import { BaseElementProps, Box, DOMElement } from "../index"
import React, { useEffect, useRef, useState } from "react"
import {
  MousePos,
  PropertyNative,
  addForcedKeyBinding,
  addKeyBinding,
  getOsdSize,
  print,
} from "@mpv-easy/tool"
import { isEqual, throttle } from "lodash-es"
import { RootNode, dispatchEvent } from "../render/flex"

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

export function computeTooltipPosition(
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

function getTooltipElement(
  node: DOMElement,
  x: number,
  y: number,
): DOMElement | undefined {
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
}: Partial<TooltipProps & BaseElementProps>) => {
  const [show, setShow] = useState(true)
  const [text, setText] = useState("")
  const mousePos = mousePosProp.value
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>(
    mousePos,
  )
  const tooltipRef = useRef<DOMElement>(null)

  useEffect(() => {
    let lastPos = mousePos
    const update = throttle(
      (pos) => {
        lastPos = pos
        const { x, y, hover } = pos
        if (!hover) {
          setShow(false)
          return
        }

        const target = getTooltipElement(RootNode, x, y)

        if (!target) {
          setShow(false)
          return
        }

        const title = target?.attributes.title
        if (title?.length) {
          const direction = getDirection(
            x,
            y,
            RootNode.layoutNode.width,
            RootNode.layoutNode.height,
          )
          const pos = computeTooltipPosition(
            tooltipRef.current,
            x,
            y,
            direction,
          )
          setTooltipPos(pos)
          setShow(true)
          setText(title)
        }
      },
      tooltipThrottle,
      {
        trailing: true,
        leading: true,
      },
    )
    mousePosProp.observe(update, isEqual)

    // addKeyBinding(
    //   "MOUSE_BTN0",
    //   "__MOUSE_BTN0__TOOLTIP",
    //   () => {
    //     console.log("======:")
    //     update(lastPos)
    //   },
    //   {
    //     forced: false,
    //     repeatable: false,
    //     complex: false,
    //   },
    // )
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
