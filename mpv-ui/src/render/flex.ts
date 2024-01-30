import { drawBorder, drawRect } from "@mpv-easy/assdraw"
import {
  getAssScale,
  assert,
  parsePercentage,
  MousePos,
  KeyEvent,
  Rect,
  isPercentage,
} from "@mpv-easy/tool"
import { Len } from "../type"
import { DOMElement, MouseEvent, createNode } from "./dom"
import { getAssText, measureText, readAttr } from "../common"

export const RootNode = createNode("@mpv-easy/box")
export const RootId = `__flex_root_${Math.random().toString(16)}`

function hasTLBR(node: DOMElement): boolean {
  for (const name of ["top", "left", "bottom", "right"] as const) {
    if (typeof node.attributes[name] !== "undefined") {
      return true
    }
  }
  return false
}
export function lenToNumber(
  node: DOMElement,
  len: Len | undefined,
  isX: boolean,
  defaultValue = 0,
): number {
  let v = defaultValue
  switch (typeof len) {
    case "number": {
      v = len
      break
    }
    case "undefined": {
      break
    }
    case "string": {
      if (isPercentage(len)) {
        return getAxisSize(node.parentNode!, isX) * parsePercentage(len)
      }
      return parseFloat(len)
    }
    default: {
      throw new Error("len type error: " + len)
    }
  }
  return v
}

function skipFlexLayout(node: DOMElement): boolean {
  return node.attributes.position === "absolute" || hasTLBR(node)
}

function computeNodeSizeAxis(
  node: DOMElement,
  v: number | string | undefined,
  isX: boolean,
  extraSize: number,
) {
  // const v = getXAttrLen(node, isX)
  if (typeof v === "number") {
    const len = v + extraSize
    setAxisSize(node, len, isX)
    return
  }
  if (typeof v === "string") {
    assert(v.endsWith("%"), "length string must end with %")
    const parentAttrLen = getAxisAttrSize(node.parentNode!, isX)
    assert(
      !(parentAttrLen === "auto" || parentAttrLen === undefined),
      "The parent of a node of relative size cannot be auto or undefined",
    )
    const len = lenToNumber(node, v, isX) + extraSize
    setAxisSize(node, len, isX)
    return
  }
  throw new Error("computeNodeSize error, not support length: " + v)
}

function computeNodeSize(node: DOMElement, currentRenderCount: number) {
  const { attributes, layoutNode } = node

  if (node.layoutNode.computedSizeCount === currentRenderCount) {
    return
  }
  node.layoutNode.computedSizeCount = currentRenderCount

  if (attributes.id === RootId) {
    for (const c of node.childNodes) {
      computeNodeSize(c, currentRenderCount)
    }
    return
  }

  const isX = node.attributes.flexDirection !== "row"
  const paddingSize = lenToNumber(node, attributes.padding, isX)
  layoutNode.padding = paddingSize
  const borderSize = lenToNumber(node, attributes.borderSize, isX)
  layoutNode.padding = borderSize
  const extraSize = paddingSize * 2 + borderSize * 2

  const xAttr = getAxisAttrSize(node, isX)
  const yAttr = getAxisAttrSize(node, !isX)
  const xIsAuto = xAttr === undefined || xAttr === "auto"
  const yIsAuto = yAttr === undefined || yAttr === "auto"

  if (typeof attributes.text === "string" && attributes.text.length) {
    const { width, height } = measureText(node)
    layoutNode.textRect.width = width
    layoutNode.textRect.height = height

    if (xIsAuto) {
      layoutNode.width = extraSize + width
    } else {
      layoutNode.width = extraSize + lenToNumber(node, xAttr, true)
    }

    if (yIsAuto) {
      layoutNode.height = extraSize + height
    } else {
      layoutNode.height = extraSize + lenToNumber(node, yAttr, false)
    }

    // computedNodeTLBR(node)
    if (node.childNodes.length) {
      throw new Error("text node can not have child node")
    }
    return
  }

  if (xIsAuto || yIsAuto) {
    let maxXAxisLen = 0
    let maxYAxisLen = 0
    let sumXAxisLen = 0
    let sumYAxisLen = 0

    if (!xIsAuto) {
      computeNodeSizeAxis(node, xAttr, isX, extraSize)
    }
    if (!yIsAuto) {
      computeNodeSizeAxis(node, yAttr, !isX, extraSize)
    }

    for (const c of node.childNodes) {
      computeNodeSize(c, currentRenderCount)

      if (c.attributes.position === "absolute") {
        continue
      }

      const childXSize = getAxisSize(c, isX)
      const childYSize = getAxisSize(c, !isX)
      maxXAxisLen = Math.max(maxXAxisLen, childXSize)
      maxYAxisLen = Math.max(maxYAxisLen, childYSize)
      sumXAxisLen += childXSize
      sumYAxisLen += childYSize
    }

    if (xIsAuto) {
      if (isX) {
        setAxisSize(node, sumXAxisLen + extraSize, true)
      } else {
        setAxisSize(node, sumXAxisLen + extraSize, false)
      }
    }
    if (yIsAuto) {
      if (isX) {
        setAxisSize(node, maxYAxisLen + extraSize, false)
      } else {
        setAxisSize(node, sumYAxisLen + extraSize, false)
      }
    }
  } else {
    computeNodeSizeAxis(node, xAttr, isX, extraSize)
    computeNodeSizeAxis(node, yAttr, !isX, extraSize)
    for (const c of node.childNodes) {
      computeNodeSize(c, currentRenderCount)
    }
  }
}

function computedNodeTLBR(node: DOMElement) {
  const { attributes, layoutNode } = node
  let parent = node.parentNode ? node.parentNode : node
  while (parent && parent.attributes.position === "absolute") {
    parent = parent.parentNode!
  }

  // if (attributes.position !== 'absolute') {
  //   layoutNode.x = parent.layoutNode.x
  //   layoutNode.y = parent.layoutNode.y
  //   return
  // }

  assert(
    !(
      typeof attributes.left !== "undefined" &&
      typeof attributes.right !== "undefined"
    ),
    "absolute position: do not set both left and right",
  )

  assert(
    !(
      typeof attributes.top !== "undefined" &&
      typeof attributes.bottom !== "undefined"
    ),
    "absolute position: do not set both top and bottom",
  )

  setAxisPosition(node, parent.layoutNode.x, true)
  setAxisPosition(node, parent.layoutNode.y, false)

  switch (typeof attributes.left) {
    case "number": {
      layoutNode.x = parent.layoutNode.x + attributes.left
      break
    }
    case "undefined": {
      // layoutNode.x = parent.layoutNode.x
      break
    }
    case "string": {
      layoutNode.x =
        parent.layoutNode.x +
        parent.layoutNode.width * parsePercentage(attributes.left)

      break
    }
    default: {
      throw new Error(`left type error: ${attributes.left}`)
    }
  }

  switch (typeof attributes.right) {
    case "number": {
      layoutNode.x =
        parent.layoutNode.x +
        parent.layoutNode.width -
        attributes.right -
        layoutNode.width
      break
    }
    case "string": {
      layoutNode.x =
        parent.layoutNode.x +
        parent.layoutNode.width -
        layoutNode.width -
        parent.layoutNode.width * parsePercentage(attributes.right)
      break
    }
    case "undefined": {
      // layoutNode.x = parent.layoutNode.x
      break
    }
    default: {
      throw new Error(`right type error: ${attributes.right}`)
    }
  }

  switch (typeof attributes.top) {
    case "number": {
      layoutNode.y = parent.layoutNode.y + attributes.top
      break
    }
    case "string": {
      layoutNode.y =
        parent.layoutNode.y +
        parent.layoutNode.height * parsePercentage(attributes.top)
      break
    }
    case "undefined": {
      // layoutNode.y = parent.layoutNode.y
      break
    }

    default: {
      throw new Error(`bottom type top: ${attributes.top}`)
    }
  }

  switch (typeof attributes.bottom) {
    case "number": {
      layoutNode.y =
        parent.layoutNode.y +
        parent.layoutNode.height -
        attributes.bottom -
        layoutNode.height
      break
    }
    case "string": {
      layoutNode.y =
        parent.layoutNode.y +
        parent.layoutNode.height -
        layoutNode.height -
        parent.layoutNode.height * parsePercentage(attributes.bottom)
      break
    }
    case "undefined": {
      // layoutNode.y = parent.layoutNode.y
      break
    }
    default: {
      throw new Error(`bottom type bottom: ${attributes.bottom}`)
    }
  }
}

function getAxisAttrSize(n: DOMElement, isX: boolean) {
  return isX ? n.attributes.width : n.attributes.height
}
function getAxisPosition(n: DOMElement, isX: boolean) {
  return isX ? n.layoutNode.x : n.layoutNode.y
}
function getAxisSize(n: DOMElement, isX: boolean) {
  return isX ? n.layoutNode.width : n.layoutNode.height
}
function setAxisPosition(n: DOMElement, x: number, isX: boolean) {
  if (isX) {
    n.layoutNode.x = x
  } else {
    n.layoutNode.y = x
  }
}
function setAxisSize(n: DOMElement, x: number, isX: boolean) {
  if (isX) {
    n.layoutNode.width = x
  } else {
    n.layoutNode.height = x
  }
}

function computedNodeAlign(node: DOMElement) {
  const { attributes } = node
  const isX = attributes.flexDirection !== "row"

  const { justifyContent = "start", alignItems = "start" } = attributes

  const flexNodes = node.childNodes.filter((i) => !skipFlexLayout(i))

  if (justifyContent === "end") {
    flexNodes.reverse()
  }

  const nodeXSize = getAxisSize(node, isX)
  const nodeXPos = getAxisPosition(node, isX)
  const nodeYPos = getAxisPosition(node, !isX)
  const nodeYSize = getAxisSize(node, !isX)
  const nodeEndSize = nodeXPos + nodeXSize
  const nodeXEnd = nodeXPos + nodeXSize
  const nodeYEnd = nodeYPos + nodeYSize
  let xAxisStart = 0
  let yAxisStart = 0
  let xAxisSize = 0
  let yAxisSize = 0
  let maxXAxisSize = 0
  let maxYAxisSize = 0
  let sumXAxisSize = 0
  let sumYAxisSize = 0

  switch (justifyContent) {
    case "start": {
      switch (alignItems) {
        case "start": {
          xAxisStart = nodeXPos
          yAxisStart = nodeYPos
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)
            const nextXStart = xAxisStart + childXSize

            if (nextXStart > nodeXEnd) {
              yAxisStart += maxYAxisSize
              setAxisPosition(c, nodeXPos, isX)
              setAxisPosition(c, yAxisStart, !isX)
              xAxisStart = nodeXPos + childXSize
            } else {
              setAxisPosition(c, xAxisStart, isX)
              setAxisPosition(c, yAxisStart, !isX)
              xAxisStart += childXSize
            }
          }
          return
        }
        case "end": {
          xAxisStart = nodeXPos
          yAxisStart = nodeYEnd
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)
            const nextXStart = xAxisStart + childXSize
            if (nextXStart > nodeXEnd) {
              yAxisStart += maxYAxisSize
              setAxisPosition(c, nodeXPos, isX)
              setAxisPosition(c, yAxisStart - childYSize, !isX)
              xAxisStart = nodeXPos + childXSize
            } else {
              setAxisPosition(c, xAxisStart, isX)
              setAxisPosition(c, yAxisStart - childYSize, !isX)
              xAxisStart += childXSize
            }
          }
          return
        }
        case "center": {
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            sumXAxisSize += childXSize
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
          }

          xAxisStart = nodeXPos
          yAxisStart = nodeYPos

          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            const newStart = xAxisStart + childXSize
            if (newStart > nodeEndSize) {
              yAxisStart += maxYAxisSize
              setAxisPosition(c, nodeXPos, isX)
              setAxisPosition(c, yAxisStart, !isX)
              xAxisStart = nodeXPos + childXSize
            } else {
              setAxisPosition(c, xAxisStart, isX)
              setAxisPosition(
                c,
                yAxisStart + (maxYAxisSize - childYSize) / 2,
                !isX,
              )
              xAxisStart += childXSize
            }
          }
          return
        }
      }
    }
    case "end": {
      switch (alignItems) {
        case "start": {
          xAxisStart = nodeXEnd
          yAxisStart = nodeYPos
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)

            const nextXStart = xAxisStart - childXSize

            if (nextXStart < nodeXPos) {
              yAxisStart -= maxYAxisSize
              setAxisPosition(c, nodeXEnd - childXSize, isX)
              setAxisPosition(c, yAxisStart, !isX)
              xAxisStart -= childXSize
            } else {
              setAxisPosition(c, xAxisStart - childXSize, isX)
              setAxisPosition(c, yAxisStart, !isX)
              xAxisStart -= childXSize
            }
          }
          return
        }
        case "end": {
          xAxisStart = nodeXEnd
          yAxisStart = nodeYEnd
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)

            const nextXStart = xAxisStart - childXSize

            if (nextXStart < nodeXPos) {
              yAxisStart -= maxYAxisSize
              setAxisPosition(c, nodeXEnd - childXSize, isX)
              setAxisPosition(c, yAxisStart - childYSize, !isX)
              xAxisStart -= childXSize
            } else {
              setAxisPosition(c, xAxisStart - childXSize, isX)
              setAxisPosition(c, yAxisStart - childYSize, !isX)
              xAxisStart -= childXSize
            }
          }
          return
        }
        case "center": {
          xAxisStart = nodeXEnd
          yAxisStart = nodeYPos
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)
          }

          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            const newStart = xAxisStart - childXSize
            if (newStart < nodeXPos) {
              throw new Error("not support flex wrap")
            } else {
              setAxisPosition(c, newStart, isX)

              setAxisPosition(
                c,
                yAxisStart + (maxYAxisSize - childYSize) / 2,
                !isX,
              )
              xAxisStart -= childXSize
            }
          }
          return
        }
      }
    }
    case "center": {
      switch (alignItems) {
        case "start": {
          yAxisStart = nodeYPos
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)
            sumXAxisSize += childXSize
          }
          xAxisStart = nodeXPos + (nodeXSize - sumXAxisSize) / 2
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            const newStart = xAxisStart + childXSize
            if (newStart > nodeXEnd) {
              throw new Error("not support flex wrap")
            } else {
              setAxisPosition(c, xAxisStart, isX)
              setAxisPosition(c, yAxisStart, !isX)
              xAxisStart += childXSize
            }
          }
          return
        }
        case "end": {
          yAxisStart = nodeYEnd
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)
            sumXAxisSize += childXSize
          }
          xAxisStart = nodeXPos + (nodeXSize - sumXAxisSize) / 2
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            const newStart = xAxisStart + childXSize
            if (newStart > nodeXEnd) {
              throw new Error("not support flex wrap")
            } else {
              setAxisPosition(c, xAxisStart, isX)
              setAxisPosition(c, yAxisStart - childYSize, !isX)
              xAxisStart += childXSize
            }
          }
          return
        }
        case "center": {
          yAxisStart = nodeYPos
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)
            sumXAxisSize += childXSize
          }
          xAxisStart = nodeXPos + (nodeXSize - sumXAxisSize) / 2
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            const newStart = xAxisStart + childXSize
            if (newStart > nodeXEnd) {
              throw new Error("not support flex wrap")
            } else {
              setAxisPosition(c, xAxisStart, isX)

              setAxisPosition(
                c,
                yAxisStart + (nodeYSize - childYSize) / 2,
                !isX,
              )
              xAxisStart += childXSize
            }
          }
          return
        }
      }
    }
  }

  throw new Error(
    "not support flex align: " + justifyContent + " " + alignItems,
  )
}
function computeNodeLayout(node: DOMElement, currentRenderCount: number) {
  // if (!node.layoutNode._tlbr) {
  // node.layoutNode._tlbr = false
  const { layoutNode, attributes } = node

  if (layoutNode.computedLayoutCount === currentRenderCount) {
    return
  }
  layoutNode.computedLayoutCount = currentRenderCount

  if (hasTLBR(node)) {
    computedNodeTLBR(node)
  }

  switch (attributes.position) {
    case "relative": {
    }
    case undefined: {
      const isX = attributes.flexDirection !== "row"

      if (node.childNodes.length && node.attributes.display === "flex") {
        computedNodeAlign(node)
      }

      break
    }

    case "absolute": {
      if (typeof attributes.x === "number") {
        layoutNode.x = attributes.x
      }
      if (typeof attributes.y === "number") {
        layoutNode.y = attributes.y
      }

      break
    }

    default: {
      throw new Error(`error position: ${attributes.position}`)
    }
  }
  for (const i of node.childNodes) {
    computeNodeLayout(i, currentRenderCount)
  }
  // node.layoutNode._tlbr = false
  // log("----computeLayout end: ", JSON.stringify(node.layoutNode))
}

function computedLayout(node: DOMElement, currentRenderCount: number) {
  computeNodeSize(node, currentRenderCount)
  computeNodeLayout(node, currentRenderCount)
}

export function renderNode(
  node: DOMElement,
  deep: number,
  currentRenderCount: number,
) {
  computedLayout(RootNode, currentRenderCount)

  const hide = readAttr(node, "hide") ?? false
  const {
    overlay: [textOverlay, bgOverlay, borderOverlay],
    layoutNode,
    attributes,
  } = node

  if (hide) {
    for (const ovl of node.overlay) {
      ovl.hidden = true
      ovl.update()
    }
  } else if (node.nodeName === "@mpv-easy/box") {
    const assScale = getAssScale()
    let {
      backgroundColor = "FFFFFFFF",
      borderSize = 0,
      borderColor = "FFFFFFFF",
      padding = 0,
      justifyContent = "start",
      alignItems = "start",
      borderRadius = 0,
      flexDirection = "column",
      zIndex = deep,
    } = attributes

    textOverlay.z = zIndex + 2
    bgOverlay.z = zIndex + 1
    borderOverlay.z = zIndex + 0

    const paddingSize =
      typeof padding === "string"
        ? parsePercentage(padding) * layoutNode.width
        : padding

    const borderRadiusSize =
      typeof borderRadius === "string"
        ? parsePercentage(borderRadius) * layoutNode.width
        : borderRadius

    if (backgroundColor.length === 6) {
      backgroundColor += "00"
    }
    if (borderColor.length === 6) {
      borderColor += "00"
    }

    if (typeof borderSize === "string") {
      borderSize = layoutNode.width * parsePercentage(borderSize)
    }

    const { x, y, width, height } = layoutNode

    if (borderSize) {
      borderOverlay.data = drawBorder({
        x: (x + paddingSize) * assScale,
        y: (y + paddingSize) * assScale,
        width: (width - paddingSize * 2) * assScale,
        height: (height - paddingSize * 2) * assScale,
        borderColor,
        borderSize: borderSize * assScale,
      })
      borderOverlay.hidden = false
      borderOverlay.computeBounds = false
    }

    if (attributes.text?.length) {
      let textX = 0 + paddingSize + layoutNode.x + borderSize
      let textY = 0 + paddingSize + layoutNode.y + borderSize

      const { textRect } = layoutNode
      switch (flexDirection) {
        case "column": {
          switch (justifyContent) {
            case "start": {
              break
            }
            case "center": {
              textX +=
                (layoutNode.width -
                  textRect.width -
                  2 * paddingSize -
                  2 * borderSize) /
                2
              break
            }
            case "end": {
              textX +=
                layoutNode.width -
                textRect.width -
                2 * paddingSize -
                2 * borderSize
              break
            }
          }
          switch (alignItems) {
            case "start": {
              break
            }
            case "center": {
              textY +=
                (layoutNode.height -
                  textRect.height -
                  2 * paddingSize -
                  2 * borderSize) /
                2
              break
            }
            case "end": {
              textY +=
                layoutNode.height -
                textRect.height -
                2 * paddingSize -
                2 * borderSize
              break
            }
          }
          break
        }
        case "row": {
          switch (justifyContent) {
            case "start": {
              break
            }
            case "center": {
              textY +=
                (layoutNode.height -
                  textRect.height -
                  2 * paddingSize -
                  2 * borderSize) /
                2
              break
            }
            case "end": {
              textY +=
                layoutNode.height -
                textRect.height -
                2 * paddingSize -
                2 * borderSize
              break
            }
          }

          switch (alignItems) {
            case "start": {
              break
            }
            case "center": {
              textX +=
                (layoutNode.width -
                  textRect.width -
                  2 * paddingSize -
                  2 * borderSize) /
                2
              break
            }
            case "end": {
              textX +=
                layoutNode.width -
                textRect.width -
                2 * paddingSize -
                2 * borderSize
              break
            }
          }
        }
        default: {
          throw new Error(
            "text layout not support: justifyContent " +
            justifyContent +
            " alignItems " +
            alignItems,
          )
        }
      }

      textOverlay.data = getAssText(node, textX * assScale, textY * assScale)

      textOverlay.hidden = false
    }
    let bgData = ""
    if (width && height) {
      const rect = new Rect(
        x + borderSize + paddingSize,
        y + borderSize + paddingSize,
        width - 2 * borderSize - 2 * paddingSize,
        height - 2 * borderSize - 2 * paddingSize,
      )

      bgData = drawRect({
        ...rect.scale(assScale),
        color: backgroundColor,
        borderRadius: borderRadiusSize * assScale,
      })
    }

    borderOverlay.hidden = false
    borderOverlay.update()

    bgOverlay.data = bgData
    bgOverlay.hidden = false
    bgOverlay.update()

    textOverlay.hidden = false
    textOverlay.update()
  }
  for (const i of node.childNodes) {
    renderNode(i, deep + 1, currentRenderCount)
  }
  currentRenderCount++
}

export function dispatchEventForNode(
  node: DOMElement,
  pos: MousePos,
  event: KeyEvent,
) {
  const { attributes, layoutNode } = node
  // console.log("----dispatchEventForNode", attributes.id, layoutNode.x, layoutNode.y, layoutNode.width, layoutNode.height)

  if (node.nodeName === "@mpv-easy/box" && node.attributes?.id !== RootId) {
    const mouseEvent = new MouseEvent(node, pos.x, pos.y)
    if (node.layoutNode.hasPoint(pos.x, pos.y)) {
      if (pos.hover) {
        if (event.event === "press") {
          if (layoutNode._mouseDown) {
            attributes.onMousePress?.(mouseEvent)
          } else if (!layoutNode._mouseIn) {
            attributes.onMouseEnter?.(mouseEvent)
            layoutNode._mouseIn = true
          } else {
            attributes.onMouseMove?.(mouseEvent)
          }
        } else if (!layoutNode._mouseDown && event.event === "down") {
          attributes.onMouseDown?.(mouseEvent)
          layoutNode._mouseDown = true
        } else if (event.event === "up") {
          attributes.onMouseUp?.(mouseEvent)
          layoutNode._mouseDown = false
        }
      } else if (layoutNode._mouseIn) {
        attributes.onMouseLeave?.(mouseEvent)
        layoutNode._mouseIn = false
      }
    } else {
      if (layoutNode._mouseIn) {
        attributes.onMouseLeave?.(mouseEvent)
        layoutNode._mouseIn = false
      }
    }
  }
}

export function dispatchEvent(
  node: DOMElement,
  pos: MousePos,
  event: KeyEvent,
) {
  if (node.attributes.hide) {
    return
  }
  for (const c of node.childNodes) {
    dispatchEventForNode(c, pos, event)
    dispatchEvent(c, pos, event)
  }
  dispatchEventForNode(node, pos, event)
}
