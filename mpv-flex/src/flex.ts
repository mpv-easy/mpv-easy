import { BaseDom, BaseMouseEvent, EventName, EventNameList } from "./dom"
import { type Shape } from "./shape"
import { assert } from "./assert"
import { isPercentage, parsePercentage } from "./number"
import { Len } from "./type"

function hasTLBR<D extends BaseDom>(node: D): boolean {
  const attr = node.attributes
  return (
    attr.top !== undefined ||
    attr.left !== undefined ||
    attr.bottom !== undefined ||
    attr.right !== undefined
  )
}

export function lenToNumber<D extends BaseDom>(
  node: D,
  len: Len | undefined,
  isX: boolean,
  defaultValue = 0,
): number {
  if (len === undefined) return defaultValue
  if (typeof len === "number") return len
  if (typeof len === "string") {
    if (isPercentage(len)) {
      return getAxisSize(node.parentNode!, isX) * parsePercentage(len)
    }
    return +len
  }
  throw new Error(`len type error: ${len}`)
}

function skipFlexLayout<D extends BaseDom>(node: D): boolean {
  const attr = node.attributes
  return (
    attr.position === "absolute" ||
    hasTLBR(node) ||
    attr.x !== undefined ||
    attr.y !== undefined
  )
}

const defaultZIndexStep = 1

function getAxisAttrSize<D extends BaseDom>(n: D, isX: boolean) {
  return isX ? n.attributes.width : n.attributes.height
}
function getAxisSize<D extends BaseDom>(n: D, isX: boolean) {
  return isX ? n.layoutNode.width : n.layoutNode.height
}
function _setAxisPosition<D extends BaseDom>(n: D, x: number, isX: boolean) {
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
  abstract customIsRootNode(node: BaseDom<A, P, E>): boolean
  abstract customCreateRootNode(): BaseDom<A, P, E>
  abstract customRenderRoot(node: BaseDom<A, P, E>): void
  abstract customMeasureNode(node: BaseDom<A, P, E>): Shape
  abstract customComputeZIndex(node: BaseDom<A, P, E>, zIndex: number): void

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
  abstract customIsMouseClick(e: BaseMouseEvent<A, P, E>): boolean

  constructor() {
    this.rootNode = this.customCreateRootNode()
  }

  renderRoot() {
    this.computeNodeSize(this.rootNode, 0)
    this.computeNodeLayout(this.rootNode)
    this.customRenderRoot(this.rootNode)
  }

  private computedNodeTLBR(node: BaseDom<A, P, E>) {
    const { attributes, layoutNode } = node
    let parent = node.parentNode || node
    while (parent && parent.attributes.position === "absolute") {
      parent = parent.parentNode!
    }

    const { left, right, top, bottom } = attributes
    const pLayout = parent.layoutNode

    assert(
      !(left !== undefined && right !== undefined),
      "absolute position: do not set both left and right",
    )
    assert(
      !(top !== undefined && bottom !== undefined),
      "absolute position: do not set both top and bottom",
    )

    layoutNode.x = pLayout.x
    layoutNode.y = pLayout.y

    switch (typeof left) {
      case "number":
        layoutNode.x = pLayout.x + left
        break
      case "string":
        layoutNode.x = pLayout.x + pLayout.width * parsePercentage(left)
        break
    }

    switch (typeof right) {
      case "number":
        layoutNode.x = pLayout.x + pLayout.width - right - layoutNode.width
        break
      case "string":
        layoutNode.x =
          pLayout.x +
          pLayout.width -
          layoutNode.width -
          pLayout.width * parsePercentage(right)
        break
    }

    switch (typeof top) {
      case "number":
        layoutNode.y = pLayout.y + top
        break
      case "string":
        layoutNode.y = pLayout.y + pLayout.height * parsePercentage(top)
        break
    }

    switch (typeof bottom) {
      case "number":
        layoutNode.y = pLayout.y + pLayout.height - bottom - layoutNode.height
        break
      case "string":
        layoutNode.y =
          pLayout.y +
          pLayout.height -
          layoutNode.height -
          pLayout.height * parsePercentage(bottom)
        break
    }
  }

  // Pass parentZIndex to avoid traversing up the tree
  private computeZIndex(node: BaseDom<A, P, E>, parentZIndex: number): number {
    const zIndex = node.attributes.zIndex
    return typeof zIndex === "number"
      ? zIndex
      : parentZIndex + defaultZIndexStep
  }

  private computeNodeSize(node: BaseDom<A, P, E>, parentZIndex: number) {
    const { attributes, layoutNode, childNodes } = node
    const childCount = childNodes.length
    const isX = attributes.flexDirection !== "row"

    const zIndex = this.computeZIndex(node, parentZIndex)
    this.customComputeZIndex(node, zIndex)

    const paddingSize = lenToNumber(node, attributes.padding, isX)
    layoutNode.padding = paddingSize
    const borderSize = lenToNumber(node, attributes.borderSize, isX)
    layoutNode.border = borderSize
    const extraSize = (paddingSize + borderSize) * 2

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
      for (let i = 0; i < childCount; i++) {
        this.computeNodeSize(childNodes[i], zIndex)
      }
      return
    }

    if (!xIsAuto) this.computeNodeSizeAxis(node, xAttr, isX, extraSize)
    if (!yIsAuto) this.computeNodeSizeAxis(node, yAttr, !isX, extraSize)

    let maxXAxisLen = 0
    let maxYAxisLen = 0
    let sumXAxisLen = 0

    for (let i = 0; i < childCount; i++) {
      const c = childNodes[i]
      this.computeNodeSize(c, zIndex)

      if (c.attributes.position !== "absolute") {
        const cLayout = c.layoutNode
        const childXSize = isX ? cLayout.width : cLayout.height
        const childYSize = isX ? cLayout.height : cLayout.width
        if (childXSize > maxXAxisLen) maxXAxisLen = childXSize
        if (childYSize > maxYAxisLen) maxYAxisLen = childYSize
        sumXAxisLen += childXSize
      }
    }

    if (xIsAuto) {
      setAxisSize(node, (isX ? sumXAxisLen : maxYAxisLen) + extraSize, true)
    }
    if (yIsAuto) {
      setAxisSize(node, (isX ? maxYAxisLen : sumXAxisLen) + extraSize, false)
    }

    if (attributes.alignContent === "stretch") {
      const stretchSize =
        (isX ? node.layoutNode.height : node.layoutNode.width) - extraSize
      for (let i = 0; i < childCount; i++) {
        const c = childNodes[i]
        if (isX) {
          if (c.attributes.height === undefined)
            c.layoutNode.height = stretchSize
        } else {
          if (c.attributes.width === undefined) c.layoutNode.width = stretchSize
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

  // Helper to position a single flex child
  private positionFlexChild(
    c: BaseDom<A, P, E>,
    xPos: number,
    yPos: number,
    isX: boolean,
  ) {
    if (isX) {
      c.layoutNode.x = xPos
      c.layoutNode.y = yPos
    } else {
      c.layoutNode.y = xPos
      c.layoutNode.x = yPos
    }
  }

  private computedNodeAlign(node: BaseDom<A, P, E>) {
    const { attributes, childNodes } = node
    const childCount = childNodes.length
    if (childCount === 0) return

    const isX = attributes.flexDirection !== "row"
    const { justifyContent = "start", alignItems = "start" } = attributes

    const nodeLayout = node.layoutNode
    const nodeExtraSize = nodeLayout.padding + nodeLayout.border
    const extraSize2 = nodeExtraSize * 2

    const nodeXPos = (isX ? nodeLayout.x : nodeLayout.y) + nodeExtraSize
    const nodeYPos = (isX ? nodeLayout.y : nodeLayout.x) + nodeExtraSize
    const nodeXSize = (isX ? nodeLayout.width : nodeLayout.height) - extraSize2
    const nodeYSize = (isX ? nodeLayout.height : nodeLayout.width) - extraSize2
    const nodeXEnd = nodeXPos + nodeXSize
    const nodeYEnd = nodeYPos + nodeYSize

    // Pre-calculate flex children metrics in single pass
    let sumXAxisSize = 0
    let maxYAxisSize = 0
    let flexCount = 0

    for (let i = 0; i < childCount; i++) {
      const c = childNodes[i]
      if (skipFlexLayout(c)) continue
      flexCount++
      const cLayout = c.layoutNode
      const childXSize = isX ? cLayout.width : cLayout.height
      const childYSize = isX ? cLayout.height : cLayout.width
      sumXAxisSize += childXSize
      if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
    }

    if (flexCount === 0) return

    // Calculate starting position and gap
    let xAxisStart: number
    let xGap = 0

    switch (justifyContent) {
      case "end":
        xAxisStart = nodeXEnd
        break
      case "center":
        xAxisStart = nodeXPos + (nodeXSize - sumXAxisSize) / 2
        break
      case "space-between":
        xAxisStart = nodeXPos
        xGap = flexCount > 1 ? (nodeXSize - sumXAxisSize) / (flexCount - 1) : 0
        break
      default: // "start"
        xAxisStart = nodeXPos
    }

    // Calculate Y axis base position
    const yAxisStart = alignItems === "end" ? nodeYEnd : nodeYPos

    // Position children based on justifyContent direction
    if (justifyContent === "end") {
      // Reverse iteration for "end" alignment
      for (let i = childCount - 1; i >= 0; i--) {
        const c = childNodes[i]
        if (skipFlexLayout(c)) continue

        const cLayout = c.layoutNode
        const childXSize = isX ? cLayout.width : cLayout.height
        const childYSize = isX ? cLayout.height : cLayout.width

        const xPos = xAxisStart - childXSize
        let yPos: number

        switch (alignItems) {
          case "end":
            yPos = yAxisStart - childYSize
            break
          case "center":
            yPos = nodeYPos + (maxYAxisSize - childYSize) / 2
            break
          default: // "start", "space-between"
            yPos = yAxisStart
        }

        this.positionFlexChild(c, xPos, yPos, isX)
        xAxisStart = xPos
      }
    } else {
      // Forward iteration for other alignments
      for (let i = 0; i < childCount; i++) {
        const c = childNodes[i]
        if (skipFlexLayout(c)) continue

        const cLayout = c.layoutNode
        const childXSize = isX ? cLayout.width : cLayout.height
        const childYSize = isX ? cLayout.height : cLayout.width

        let yPos: number
        switch (alignItems) {
          case "end":
            yPos = yAxisStart - childYSize
            break
          case "center":
            yPos = nodeYPos + (nodeYSize - childYSize) / 2
            break
          default: // "start", "space-between"
            yPos = yAxisStart
        }

        this.positionFlexChild(c, xAxisStart, yPos, isX)
        xAxisStart += childXSize + xGap
      }
    }
  }

  private computeNodeLayout(node: BaseDom<A, P, E>) {
    const { layoutNode, attributes, childNodes } = node

    if (hasTLBR(node)) {
      this.computedNodeTLBR(node)
    }

    if (typeof attributes.x === "number") layoutNode.x = attributes.x
    if (typeof attributes.y === "number") layoutNode.y = attributes.y

    const position = attributes.position
    if (
      position !== "relative" &&
      position !== undefined &&
      position !== "absolute"
    ) {
      throw new Error(`error position: ${position}`)
    }

    if (childNodes.length && attributes.display === "flex") {
      this.computedNodeAlign(node)
    }

    for (let i = 0, len = childNodes.length; i < len; i++) {
      this.computeNodeLayout(childNodes[i])
    }
  }

  private dispatchMouseEventInner(
    node: BaseDom<A, P, E>,
    event: BaseMouseEvent<A, P, E>,
    dispatchMap: Record<EventName, BaseDom<A, P, E>[]>,
  ) {
    const attr = node.attributes
    if (attr.hide || attr.pointerEvents === "none") return

    const childNodes = node.childNodes
    for (let i = 0, len = childNodes.length; i < len; i++) {
      this.dispatchMouseEventInner(childNodes[i], event, dispatchMap)
    }
    this.dispatchMouseEventForNode(node, event, dispatchMap)
  }

  dispatchMouseEvent(node: BaseDom<A, P, E>, event: BaseMouseEvent<A, P, E>) {
    const dm: Record<EventName, BaseDom<A, P, E>[]> = {
      onMouseDown: [],
      onMouseUp: [],
      onClick: [],
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

    for (let i = 0, len = EventNameList.length; i < len; i++) {
      const name = EventNameList[i]
      const nodes = dm[name]
      if (!nodes.length) continue

      nodes.sort(
        (a, b) => (b.attributes.zIndex || 0) - (a.attributes.zIndex || 0),
      )

      for (let j = 0, jlen = nodes.length; j < jlen; j++) {
        if (!event.bubbles) continue
        const n = nodes[j]
        if (name === "onMouseLeave" || name === "onMouseEnter") {
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
    if (!event.bubbles) return

    const attr = node.attributes
    if (attr.pointerEvents === "none" || attr.hide) return

    const { layoutNode } = node

    if (layoutNode.hasPoint(event.x, event.y)) {
      if (event.target === undefined) {
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
        } else if (
          !layoutNode._mouseDown &&
          (this.customIsMouseDown(event) || this.customIsMouseClick(event))
        ) {
          dispatchMap.onMouseDown.push(node)
          dispatchMap.onClick.push(node)
          layoutNode._mouseDown = true
          layoutNode._mouseUp = false
          if (!layoutNode._focus) {
            layoutNode._focus = true
            dispatchMap.onFocus.push(node)
          }
          if (this.customIsMouseClick(event)) {
            layoutNode._mouseDown = false
            dispatchMap.onMouseUp.push(node)
          }
        } else if (this.customIsMouseUp(event) && !layoutNode._mouseUp) {
          dispatchMap.onMouseUp.push(node)
          layoutNode._mouseDown = false
          layoutNode._mouseUp = true
          if (!layoutNode._focus) {
            dispatchMap.onFocus.push(node)
            layoutNode._focus = true
          }
        }
      } else if (layoutNode._mouseIn) {
        dispatchMap.onMouseLeave.push(node)
        layoutNode._mouseIn = false
      }
    } else {
      if (layoutNode._mouseIn) {
        dispatchMap.onMouseLeave.push(node)
        layoutNode._mouseIn = false
      }

      if (
        layoutNode._focus &&
        (this.customIsMouseDown(event) || this.customIsMouseUp(event))
      ) {
        dispatchMap.onBlur.push(node)
        layoutNode._focus = false
      }
    }
  }
}
