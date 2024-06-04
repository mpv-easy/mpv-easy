import { drawBorder, drawRect } from "@mpv-easy/assdraw"
import {
  getAssScale,
  assert,
  parsePercentage,
  MousePos,
  KeyEvent,
  Rect,
  isPercentage,
  print,
  fileInfo,
  Overlay,
} from "@mpv-easy/tool"
import { Len } from "../type"
import { DOMElement, MouseEvent, createNode } from "./dom"
import { getAssText, measureText, readAttr } from "../common"

let _RootNode: DOMElement

export const getRootNode = () => {
  if (_RootNode) return _RootNode
  _RootNode = createNode("@mpv-easy/box")
  return _RootNode
}
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
  return (
    node.attributes.position === "absolute" ||
    hasTLBR(node) ||
    typeof node.attributes.x !== "undefined" ||
    typeof node.attributes.y !== "undefined"
  )
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

const defaultZIndexStep = 1
function computeZIndex(node: DOMElement) {
  const { attributes } = node

  if (typeof attributes.zIndex === "number") {
    return attributes.zIndex
  }
  let parent = node.parentNode

  let deep = 1
  while (parent) {
    if (typeof parent.attributes.zIndex === "undefined") {
      parent = parent.parentNode
      deep += defaultZIndexStep
    }
    if (parent && typeof parent?.attributes?.zIndex === "number") {
      return parent.attributes.zIndex + deep
    }
  }
  return deep
}

function computeNodeSize(
  node: DOMElement,
  currentRenderCount: number,
  deep: number,
) {
  const { attributes, layoutNode } = node
  const isX = node.attributes.flexDirection !== "row"

  if (node.layoutNode.computedSizeCount === currentRenderCount) {
    return
  }
  layoutNode.computedSizeCount = currentRenderCount

  const {
    osdOverlays: [textOverlay, bgOverlay, borderOverlay],
  } = node
  const zIndex = computeZIndex(node)
  textOverlay.z = zIndex + 3
  bgOverlay.z = zIndex + 2
  borderOverlay.z = zIndex + 1

  if (attributes.id === RootId) {
    for (const c of node.childNodes) {
      computeNodeSize(c, currentRenderCount, deep + 1)
    }
    return
  }

  const paddingSize = lenToNumber(node, attributes.padding, isX)
  layoutNode.padding = paddingSize
  const borderSize = lenToNumber(node, attributes.borderSize, isX)
  layoutNode.border = borderSize
  const extraSize = paddingSize * 2 + borderSize * 2

  const xAttr = getAxisAttrSize(node, isX)
  const yAttr = getAxisAttrSize(node, !isX)
  const xIsAuto = xAttr === undefined || xAttr === "auto"
  const yIsAuto = yAttr === undefined || yAttr === "auto"

  if (typeof attributes.text === "string") {
    const { width, height } = measureText(node)
    layoutNode.textRect = new Rect(
      layoutNode.textRect.x,
      layoutNode.textRect.y,
      width,
      height,
    )
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

    // The size of the text node is not affected by its child nodes
    // making it convenient for calculating offsets in child nodes.
    for (const c of node.childNodes) {
      computeNodeSize(c, currentRenderCount, deep + 1)
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
      computeNodeSize(c, currentRenderCount, deep + 1)

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
        setAxisSize(node, maxYAxisLen + extraSize, true)
      }
    }
    if (yIsAuto) {
      if (isX) {
        setAxisSize(node, maxYAxisLen + extraSize, false)
      } else {
        setAxisSize(node, sumXAxisLen + extraSize, false)
      }
    }

    if (node.attributes.alignContent === "stretch") {
      for (const c of node.childNodes) {
        if (isX) {
          if (typeof c.attributes.height === "undefined") {
            c.layoutNode.height = node.layoutNode.height - extraSize
          }
        } else {
          if (typeof c.attributes.width === "undefined") {
            c.layoutNode.width = node.layoutNode.width - extraSize
          }
        }
      }
    }
  } else {
    computeNodeSizeAxis(node, xAttr, isX, extraSize)
    computeNodeSizeAxis(node, yAttr, !isX, extraSize)
    let maxXAxisLen = 0
    let maxYAxisLen = 0

    for (const c of node.childNodes) {
      computeNodeSize(c, currentRenderCount, deep + 1)
      const childXSize = getAxisSize(c, isX)
      const childYSize = getAxisSize(c, !isX)
      maxXAxisLen = Math.max(maxXAxisLen, childXSize)
      maxYAxisLen = Math.max(maxYAxisLen, childYSize)
    }

    if (node.attributes.alignContent === "stretch") {
      for (const c of node.childNodes) {
        if (isX) {
          if (typeof c.attributes.height === "undefined") {
            c.layoutNode.height = node.layoutNode.height - extraSize
          }
        } else {
          if (typeof c.attributes.width === "undefined") {
            c.layoutNode.width = node.layoutNode.width - extraSize
          }
        }
      }
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

// TODO: maybe there is a more easy way
function computedNodeAlign(node: DOMElement) {
  const { attributes } = node
  const isX = attributes.flexDirection !== "row"

  const { justifyContent = "start", alignItems = "start" } = attributes

  const flexNodes = node.childNodes.filter((i) => !skipFlexLayout(i))

  if (justifyContent === "end") {
    flexNodes.reverse()
  }

  const nodeExtraSize = node.layoutNode.padding + node.layoutNode.border
  const nodeXPos = getAxisPosition(node, isX) + nodeExtraSize
  const nodeYPos = getAxisPosition(node, !isX) + nodeExtraSize
  const nodeXSize = getAxisSize(node, isX) - nodeExtraSize * 2
  const nodeYSize = getAxisSize(node, !isX) - nodeExtraSize * 2
  const nodeEndSize = nodeXPos + nodeXSize
  const nodeXEnd = nodeXPos + nodeXSize
  const nodeYEnd = nodeYPos + nodeYSize
  let xAxisStart = 0
  let yAxisStart = 0
  const xAxisSize = 0
  const yAxisSize = 0
  let maxXAxisSize = 0
  let maxYAxisSize = 0
  let sumXAxisSize = 0
  const sumYAxisSize = 0

  switch (justifyContent) {
    case "start": {
      switch (alignItems) {
        case "space-between":
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

            const nextStart = xAxisStart + childXSize
            if (nextStart > nodeEndSize) {
              yAxisStart += maxYAxisSize
              setAxisPosition(c, nodeXPos, isX)
              setAxisPosition(c, yAxisStart, !isX)
              xAxisStart = nodeXPos + childXSize
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
    case "end": {
      switch (alignItems) {
        case "space-between":
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

            const nextStart = xAxisStart - childXSize
            if (nextStart < nodeXPos) {
              // print("warn: not support flex wrap", c.attributes.id)
            } else {
              setAxisPosition(c, nextStart, isX)

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
        case "space-between":
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

            const nextStart = xAxisStart + childXSize
            if (nextStart > nodeXEnd) {
              // print("warn: not support flex wrap", c.attributes.id)
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

            const nextStart = xAxisStart + childXSize
            if (nextStart > nodeXEnd) {
              // print("warn: not support flex wrap", c.attributes.id)
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

            const nextStart = xAxisStart + childXSize
            if (nextStart > nodeXEnd) {
              // print("warn: not support flex wrap", c.attributes.id)
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
    case "space-between": {
      switch (alignItems) {
        case "space-between":
        case "start": {
          yAxisStart = nodeYPos
          for (const c of flexNodes) {
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            maxXAxisSize = Math.max(maxXAxisSize, childXSize)
            sumXAxisSize += childXSize
          }

          xAxisStart = nodeXPos
          const xGap = (nodeXSize - sumXAxisSize) / (flexNodes.length - 1)

          for (let i = 0; i < flexNodes.length; i++) {
            const c = flexNodes[i]
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            const nextStart = xAxisStart + childXSize
            if (nextStart > nodeXEnd) {
              // print("warn: not support flex wrap", c.attributes.id)
            } else {
              setAxisPosition(c, xAxisStart, isX)
              setAxisPosition(c, yAxisStart, !isX)
              xAxisStart += childXSize + xGap
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
          xAxisStart = nodeXPos
          const xGap = (nodeXSize - sumXAxisSize) / (flexNodes.length - 1)

          for (let i = 0; i < flexNodes.length; i++) {
            const c = flexNodes[i]
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            const nextStart = xAxisStart + childXSize
            if (nextStart > nodeXEnd) {
              // print("warn: not support flex wrap", c.attributes.id)
            } else {
              setAxisPosition(c, xAxisStart, isX)
              setAxisPosition(c, yAxisStart - childYSize, !isX)
              xAxisStart += childXSize + xGap
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
          xAxisStart = nodeXPos
          const xGap = (nodeXSize - sumXAxisSize) / (flexNodes.length - 1)
          for (let i = 0; i < flexNodes.length; i++) {
            const c = flexNodes[i]
            const childXSize = getAxisSize(c, isX)
            const childYSize = getAxisSize(c, !isX)
            const childXPos = getAxisPosition(c, isX)
            const childYPos = getAxisPosition(c, !isX)

            const nextStart = xAxisStart + childXSize
            if (nextStart > nodeXEnd) {
              // print("warn: not support flex wrap", c.attributes.id)
            } else {
              setAxisPosition(c, xAxisStart, isX)

              setAxisPosition(
                c,
                yAxisStart + (nodeYSize - childYSize) / 2,
                !isX,
              )
              xAxisStart += childXSize + xGap
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
  const { layoutNode, attributes } = node

  if (layoutNode.computedLayoutCount === currentRenderCount) {
    return
  }
  layoutNode.computedLayoutCount = currentRenderCount

  if (hasTLBR(node)) {
    computedNodeTLBR(node)
  }
  if (typeof attributes.x === "number") {
    layoutNode.x = attributes.x
  }
  if (typeof attributes.y === "number") {
    layoutNode.y = attributes.y
  }
  switch (attributes.position) {
    case "relative": {
    }
    case undefined: {
      if (node.childNodes.length && node.attributes.display === "flex") {
        computedNodeAlign(node)
      }
      break
    }

    case "absolute": {
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
  if (node.layoutNode.computedLayoutCount === currentRenderCount) {
    return
  }
  // const st1 = +Date.now()
  computeNodeSize(node, currentRenderCount, 0)
  // const st2 = +Date.now()
  computeNodeLayout(node, currentRenderCount)
  // const st3 = +Date.now()
  // console.log("layout time: ", st2 - st1, st3 - st2)
}

export function renderNode(
  node: DOMElement,
  currentRenderCount: number,
  deep: number,
) {
  computedLayout(getRootNode(), currentRenderCount)

  const hide = readAttr(node, "hide") ?? false
  const {
    osdOverlays: [textOverlay, bgOverlay, borderOverlay],
    layoutNode,
    attributes,
  } = node

  if (hide) {
    if (layoutNode._hideCache) {
      return
    }
    layoutNode._hideCache = true
    for (const ovl of node.osdOverlays) {
      ovl.hidden = true
      ovl.computeBounds = false
      ovl.update()
    }
    if (typeof attributes.backgroundImage === "string" && node.imageOverlay) {
      node.imageOverlay.remove()
    }
  } else if (node.nodeName === "@mpv-easy/box") {
    layoutNode._hideCache = false
    const assScale = getAssScale()
    let {
      backgroundColor,
      borderSize,
      borderColor = "FFFFFFFF",
      padding = 0,
      justifyContent = "start",
      alignItems = "start",
      borderRadius = 0,
      flexDirection = "column",
      backgroundImage,
      backgroundImageFormat = "bgra",
    } = attributes

    const paddingSize =
      typeof padding === "string"
        ? parsePercentage(padding) * layoutNode.width
        : padding

    const borderRadiusSize =
      typeof borderRadius === "string"
        ? parsePercentage(borderRadius) * layoutNode.width
        : borderRadius

    if (borderColor.length === 6) {
      borderColor += "00"
    }

    if (typeof borderSize === "string") {
      borderSize = layoutNode.width * parsePercentage(borderSize)
    }

    const { x, y, width, height } = layoutNode

    // border ovl

    if (typeof borderSize !== "undefined") {
      borderOverlay.data = drawBorder({
        x: x * assScale,
        y: y * assScale,
        width: width * assScale,
        height: height * assScale,
        borderColor,
        borderSize: borderSize * assScale,
      })
      borderOverlay.hidden = false
      borderOverlay.computeBounds = false
      borderOverlay.hidden = false
      borderOverlay.update()
    }

    borderSize = borderSize || 0

    // bg ovl

    if (typeof backgroundColor !== "undefined") {
      if (backgroundColor.length === 6) {
        backgroundColor += "00"
      }
      const rect = new Rect(
        x + borderSize + paddingSize,
        y + borderSize + paddingSize,
        width - 2 * borderSize - 2 * paddingSize,
        height - 2 * borderSize - 2 * paddingSize,
      )

      const bgData = drawRect({
        ...rect.scale(assScale),
        color: backgroundColor,
        borderRadius: borderRadiusSize * assScale,
      })

      bgOverlay.data = bgData
      bgOverlay.hidden = false
      bgOverlay.update()
    }

    // text ovl

    if (typeof attributes.text !== "undefined") {
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
      textOverlay.update()
    }

    // image
    if (typeof backgroundImage === "string") {
      const h = attributes.height
      const w = attributes.width
      const id = attributes.id

      if (typeof id !== "number" || id < 0 || id > 63) {
        throw new Error("backgroundImage'id must be a number in [0, 63]")
      }
      if (typeof w !== "number" || typeof h !== "number") {
        throw new Error("backgroundImage's width and height must be number")
      }

      if (!node.imageOverlay) {
        node.imageOverlay = new Overlay(id)
      }
      const overlay = node.imageOverlay

      backgroundImage = backgroundImage.split("?")[0]
      const info = fileInfo(backgroundImage)
      if (!info) {
        // throw new Error("backgroundImage file not found")
        // print("backgroundImage file not found: " + backgroundImage)
      } else {
        const { size } = info
        const pixels = w * h * 4
        if (pixels !== size) {
          // throw new Error("backgroundImage size error: " + w + '-' + h + "-" + size)
          // print("backgroundImage size error: " + w + "-" + h + "-" + size)
        } else {
          overlay.x = x | 0
          overlay.y = y | 0
          overlay.file = backgroundImage
          overlay.fmt = backgroundImageFormat
          overlay.w = w | 0
          overlay.h = h | 0
          overlay.offset = 0
          overlay.stride = (w | 0) << 2
          overlay.update()
        }
      }
    }
  }
  for (const i of node.childNodes) {
    renderNode(i, currentRenderCount, deep + 1)
  }
}

export function dispatchEventForNode(
  node: DOMElement,
  pos: MousePos,
  event: KeyEvent,
  mouseEvent: MouseEvent,
) {
  if (!mouseEvent.bubbles) {
    return
  }
  if (node.attributes.pointerEvents === "none") {
    return
  }
  if (node.attributes.hide) {
    return
  }
  const { attributes, layoutNode } = node
  if (node.layoutNode.hasPoint(pos.x, pos.y)) {
    if (typeof mouseEvent.target === "undefined") {
      mouseEvent.target = node
    }

    if (pos.hover) {
      if (event.key_name === "WHEEL_DOWN") {
        attributes.onWheelDown?.(mouseEvent)
        return
      }
      if (event.key_name === "WHEEL_UP") {
        attributes.onWheelUp?.(mouseEvent)
        return
      }

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
        if (!layoutNode._mouseDown) {
          attributes.onMouseDown?.(mouseEvent)
          attributes.onClick?.(mouseEvent)
          layoutNode._mouseDown = true
          layoutNode._mouseUp = false
          if (!layoutNode._focus) {
            layoutNode._focus = true
            attributes.onFocus?.(mouseEvent)
          }
        }
      } else if (event.event === "up") {
        if (!layoutNode._mouseUp) {
          attributes.onMouseUp?.(mouseEvent)
          layoutNode._mouseDown = false
          layoutNode._mouseUp = true
          if (!layoutNode._focus) {
            attributes.onFocus?.(mouseEvent)
            layoutNode._focus = true
          }
        }
      }
    } else if (layoutNode._mouseIn) {
      attributes.onMouseLeave?.(mouseEvent)
      layoutNode._mouseIn = false
    }
  } else {
    const mouseEvent = new MouseEvent(node, pos.x, pos.y)
    // mouseEvent.target = undefined
    if (layoutNode._mouseIn) {
      attributes.onMouseLeave?.(mouseEvent)
      layoutNode._mouseIn = false
      // layoutNode._mouseUp = false
    }

    if (layoutNode._focus && (event.event === "down" || event.event === "up")) {
      attributes.onBlur?.(mouseEvent)
      layoutNode._focus = false
      // layoutNode._mouseIn = false
      // layoutNode._mouseUp = false
    }
  }
}

export function dispatchEvent(
  node: DOMElement,
  pos: MousePos,
  event: KeyEvent,
  mouseEvent = new MouseEvent(undefined, pos.x, pos.y),
) {
  if (node.attributes.hide || node.attributes.pointerEvents === "none") {
    return
  }
  for (const c of node.childNodes) {
    dispatchEvent(c, pos, event, mouseEvent)
  }
  dispatchEventForNode(node, pos, event, mouseEvent)
}
