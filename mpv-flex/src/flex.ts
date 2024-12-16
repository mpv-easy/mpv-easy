import { BaseDom, BaseMouseEvent, EventName, EventNameList } from "./dom"
import { type Shape } from "./shape"
import { assert } from "./assert"
import { isPercentage, parsePercentage } from "./number"
import { Len } from "./type"

function hasTLBR<D extends BaseDom>(node: D): boolean {
  if (
    typeof node.attributes.top !== "undefined" ||
    typeof node.attributes.left !== "undefined" ||
    typeof node.attributes.bottom !== "undefined" ||
    typeof node.attributes.right !== "undefined"
  ) {
    return true
  }
  return false
}

export function lenToNumber<D extends BaseDom>(
  node: D,
  len: Len | undefined,
  isX: boolean,
  defaultValue = 0,
): number {
  switch (typeof len) {
    case "number": {
      return len
    }
    case "undefined": {
      break
    }
    case "string": {
      return isPercentage(len)
        ? getAxisSize(node.parentNode!, isX) * parsePercentage(len)
        : +len
    }
    default: {
      throw new Error(`len type error: ${len}`)
    }
  }
  return defaultValue
}

function skipFlexLayout<D extends BaseDom>(node: D): boolean {
  return (
    node.attributes.position === "absolute" ||
    hasTLBR(node) ||
    typeof node.attributes.x !== "undefined" ||
    typeof node.attributes.y !== "undefined"
  )
}

const defaultZIndexStep = 1

function getAxisAttrSize<D extends BaseDom>(n: D, isX: boolean) {
  return isX ? n.attributes.width : n.attributes.height
}
function getAxisPosition<D extends BaseDom>(n: D, isX: boolean) {
  return isX ? n.layoutNode.x : n.layoutNode.y
}
function getAxisSize<D extends BaseDom>(n: D, isX: boolean) {
  return isX ? n.layoutNode.width : n.layoutNode.height
}
function setAxisPosition<D extends BaseDom>(n: D, x: number, isX: boolean) {
  if (isX) {
    n.layoutNode.x = x
  } else {
    n.layoutNode.y = x
  }
}
function setAxisSize<D extends BaseDom>(n: D, x: number, isX: boolean) {
  if (isX) {
    n.layoutNode.width = x
  } else {
    n.layoutNode.height = x
  }
}

export abstract class Flex<A extends {}, P extends {}, E extends {} = {}> {
  rootNode: BaseDom<A, P, E>
  // abstract customCreateNode(): BaseDom<A, P, E>
  abstract customIsRootNode(node: BaseDom<A, P, E>): boolean
  abstract customCreateRootNode(): BaseDom<A, P, E>
  abstract customRenderRoot(node: BaseDom<A, P, E>): void

  abstract customMeasureNode(node: BaseDom<A, P, E>): Shape
  abstract customComputeZIndex(node: BaseDom<A, P, E>, zIndex: number): void

  // event
  abstract customCreateMouseEvent(
    node: BaseDom<A, P, E> | undefined,
    x: number,
    y: number,
    hover: boolean,
    event: E,
  ): BaseMouseEvent<A, P, E>
  abstract customIsWheelDown(e: BaseMouseEvent<A, P, E>): boolean
  abstract customIsWheelUp(e: BaseMouseEvent<A, P, E>): boolean
  abstract customIsMousePress(e: BaseMouseEvent<A, P, E>): boolean
  abstract customIsMouseDown(e: BaseMouseEvent<A, P, E>): boolean
  abstract customIsMouseUp(e: BaseMouseEvent<A, P, E>): boolean

  constructor() {
    this.rootNode = this.customCreateRootNode()
  }

  renderRoot() {
    // const t1 = Date.now()
    this.computeNodeSize(this.rootNode)

    // const t2 = Date.now()
    this.computeNodeLayout(this.rootNode)
    // const t3 = Date.now()
    this.customRenderRoot(this.rootNode)
    // const t4 = Date.now()
    // console.log('renderRoot: ', t2 - t1, t3 - t2, t4 - t3)
  }
  private computedNodeTLBR(node: BaseDom<A, P, E>) {
    const { attributes, layoutNode } = node
    let parent = node.parentNode ? node.parentNode : node
    while (parent && parent.attributes.position === "absolute") {
      parent = parent.parentNode!
    }

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
        break
      }
      default: {
        throw new Error(`bottom type bottom: ${attributes.bottom}`)
      }
    }
  }

  private computeZIndex(node: BaseDom<A, P, E>) {
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

  private computeNodeSize(node: BaseDom<A, P, E>) {
    // console.log('computeNodeSize', node.attributes.id, node.dirty, isDirty(node))
    const { attributes, layoutNode } = node

    const isX = attributes.flexDirection !== "row"

    // const st1 = Date.now()
    const zIndex = this.computeZIndex(node)
    // const st2 = Date.now()
    // console.log('computeZIndex', node.attributes.id, st2 - st1)

    this.customComputeZIndex(node, zIndex)

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
      const { width, height } = this.customMeasureNode(node)

      layoutNode.width = xIsAuto
        ? extraSize + width
        : extraSize + lenToNumber(node, xAttr, true)
      layoutNode.height = yIsAuto
        ? extraSize + height
        : extraSize + lenToNumber(node, yAttr, false)

      // The size of the text node is not affected by its child nodes
      // making it convenient for calculating offsets in child nodes.
      for (const c of node.childNodes) {
        this.computeNodeSize(c)
      }
      return
    }

    if (xIsAuto || yIsAuto) {
      let maxXAxisLen = 0
      let maxYAxisLen = 0
      let sumXAxisLen = 0
      let sumYAxisLen = 0

      if (!xIsAuto) {
        this.computeNodeSizeAxis(node, xAttr, isX, extraSize)
      }
      if (!yIsAuto) {
        this.computeNodeSizeAxis(node, yAttr, !isX, extraSize)
      }

      for (const c of node.childNodes) {
        this.computeNodeSize(c)

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
      this.computeNodeSizeAxis(node, xAttr, isX, extraSize)
      this.computeNodeSizeAxis(node, yAttr, !isX, extraSize)
      let maxXAxisLen = 0
      let maxYAxisLen = 0

      for (const c of node.childNodes) {
        this.computeNodeSize(c)
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

  private computeNodeSizeAxis(
    node: BaseDom<A, P, E>,
    v: number | string | undefined,
    isX: boolean,
    extraSize: number,
  ) {
    switch (typeof v) {
      case "number": {
        const len = v + extraSize
        setAxisSize(node, len, isX)
        return
      }
      case "string": {
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
    }
    throw new Error(`computeNodeSize error, not support length: ${v}`)
  }

  private computedNodeAlign(node: BaseDom<A, P, E>) {
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
    // const xAxisSize = 0
    // const yAxisSize = 0
    let maxXAxisSize = 0
    let maxYAxisSize = 0
    let sumXAxisSize = 0
    // const sumYAxisSize = 0

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
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

              sumXAxisSize += childXSize
              maxYAxisSize = Math.max(maxYAxisSize, childYSize)
            }

            xAxisStart = nodeXPos
            yAxisStart = nodeYPos

            for (const c of flexNodes) {
              const childXSize = getAxisSize(c, isX)
              const childYSize = getAxisSize(c, !isX)
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

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
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

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
              // const childYSize = getAxisSize(c, !isX)
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

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
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

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
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

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
              // const childYSize = getAxisSize(c, !isX)
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

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
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

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
              // const childXPos = getAxisPosition(c, isX)
              // const childYPos = getAxisPosition(c, !isX)

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

    throw new Error(`not support flex align: ${justifyContent} ${alignItems}`)
  }
  private computeNodeLayout(node: BaseDom<A, P, E>) {
    // console.log('computeNodeLayout', node.attributes.id, node.dirty, isDirty(node))
    const { layoutNode, attributes } = node

    if (hasTLBR(node)) {
      this.computedNodeTLBR(node)
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
        if (node.childNodes.length && attributes.display === "flex") {
          this.computedNodeAlign(node)
        }
        break
      }
      case "absolute": {
        if (node.childNodes.length && attributes.display === "flex") {
          this.computedNodeAlign(node)
        }
        break
      }
      default: {
        throw new Error(`error position: ${attributes.position}`)
      }
    }
    for (const i of node.childNodes) {
      this.computeNodeLayout(i)
    }
  }

  private dispatchMouseEventInner(
    node: BaseDom<A, P, E>,
    event: BaseMouseEvent<A, P, E>,
    dispatchMap: Record<EventName, BaseDom<A, P, E>[]>,
  ) {
    if (node.attributes.hide || node.attributes.pointerEvents === "none") {
      return
    }
    for (const c of node.childNodes) {
      this.dispatchMouseEventInner(c, event, dispatchMap)
    }
    this.dispatchMouseEventForNode(node, event, dispatchMap)
  }
  dispatchMouseEvent(node: BaseDom<A, P, E>, event: BaseMouseEvent<A, P, E>) {
    const dm: Record<EventName, BaseDom<A, P, E>[]> = {
      onClick: [],
      onMouseDown: [],
      onMouseUp: [],
      onMouseMove: [],
      onMousePress: [],
      onMouseEnter: [],
      onMouseLeave: [],
      onWheelDown: [],
      onWheelUp: [],
      onBlur: [],
      onFocus: [],
    }
    this.dispatchMouseEventInner(node, event, dm)

    for (const name of EventNameList) {
      const nodes = dm[name]
      if (!nodes.length) {
        continue
      }

      const sorted = nodes.sort(
        (a, b) => (b.attributes.zIndex || 0) - (a.attributes.zIndex || 0),
      )
      for (const n of sorted) {
        if (!event.bubbles) {
          continue
        }
        if (name === "onMouseLeave" || name === "onMouseEnter") {
          // https://github.com/mpv-easy/mpv-easy/issues/40
          event.target = n
        }
        n.attributes[name]?.(event)
      }
    }
  }

  private dispatchMouseEventForNode(
    node: BaseDom<A, P, E>,
    event: BaseMouseEvent<A, P, E>,
    dispatchMap: Record<EventName, BaseDom<A, P, E>[]>,
  ) {
    if (!event.bubbles) {
      return
    }
    if (node.attributes.pointerEvents === "none") {
      return
    }
    if (node.attributes.hide) {
      return
    }
    const { layoutNode } = node
    if (node.layoutNode.hasPoint(event.x, event.y)) {
      if (typeof event.target === "undefined") {
        event.target = node
      }

      if (event.hover) {
        if (this.customIsWheelDown(event)) {
          dispatchMap.onWheelDown.push(node)
          return
        }
        if (this.customIsWheelUp(event)) {
          dispatchMap.onWheelUp.push(node)
          return
        }

        if (this.customIsMousePress(event)) {
          if (layoutNode._mouseDown) {
            dispatchMap.onMousePress.push(node)
          } else if (!layoutNode._mouseIn) {
            dispatchMap.onMouseEnter.push(node)

            layoutNode._mouseIn = true
          } else {
            dispatchMap.onMouseMove.push(node)
          }
        } else if (!layoutNode._mouseDown && this.customIsMouseDown(event)) {
          if (!layoutNode._mouseDown) {
            dispatchMap.onMouseDown.push(node)
            dispatchMap.onClick.push(node)
            layoutNode._mouseDown = true
            layoutNode._mouseUp = false
            if (!layoutNode._focus) {
              layoutNode._focus = true
              dispatchMap.onFocus.push(node)
            }
          }
        } else if (this.customIsMouseUp(event)) {
          if (!layoutNode._mouseUp) {
            dispatchMap.onMouseUp.push(node)
            layoutNode._mouseDown = false
            layoutNode._mouseUp = true
            if (!layoutNode._focus) {
              dispatchMap.onFocus.push(node)
              layoutNode._focus = true
            }
          }
        }
      } else if (layoutNode._mouseIn) {
        dispatchMap.onMouseLeave.push(node)
        layoutNode._mouseIn = false
      }
    } else {
      // mouseEvent.target = undefined
      if (layoutNode._mouseIn) {
        dispatchMap.onMouseLeave.push(node)
        layoutNode._mouseIn = false
        // layoutNode._mouseUp = false
      }

      if (
        layoutNode._focus &&
        (this.customIsMouseDown(event) || this.customIsMouseUp(event))
      ) {
        dispatchMap.onBlur.push(node)
        layoutNode._focus = false
        // layoutNode._mouseIn = false
        // layoutNode._mouseUp = false
      }
    }
  }
}
