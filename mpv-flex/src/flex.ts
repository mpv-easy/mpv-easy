import { BaseDom, BaseMouseEvent, EventName, EventNameList } from "./dom"
import { type Shape } from "./shape"
import { assert } from "./assert"
import { isPercentage, parsePercentage } from "./number"
import { Len } from "./type"

// Constants to avoid repeated string comparisons
const POSITION_ABSOLUTE = "absolute"
const POSITION_RELATIVE = "relative"
const FLEX_DIRECTION_ROW = "row"
const DISPLAY_FLEX = "flex"
const ALIGN_STRETCH = "stretch"
const ALIGN_START = "start"
const ALIGN_END = "end"

const DEFAULT_ZINDEX_STEP = 1

/**
 * Check if node has top/left/bottom/right positioning
 * Optimization: Early return on first match, cache attribute access
 */
function hasTLBR<D extends BaseDom>(node: D): boolean {
  const attr = node.attributes
  return (
    attr.top !== undefined ||
    attr.left !== undefined ||
    attr.bottom !== undefined ||
    attr.right !== undefined
  )
}

/**
 * Check if node should skip flex layout
 * Optimization: Combined conditions, reduced function calls
 */
function skipFlexLayout<D extends BaseDom>(node: D): boolean {
  const attr = node.attributes
  return (
    attr.position === POSITION_ABSOLUTE ||
    hasTLBR(node) ||
    attr.x !== undefined ||
    attr.y !== undefined
  )
}

/**
 * Convert length value to number
 * Optimization: Use switch for type checking (single typeof evaluation)
 */
export function lenToNumber<D extends BaseDom>(
  node: D,
  len: Len | undefined,
  isX: boolean,
  defaultValue = 0,
): number {
  switch (typeof len) {
    case "number":
      return len
    case "string":
      return isPercentage(len)
        ? getAxisSize(node.parentNode!, isX) * parsePercentage(len)
        : +len
    case "undefined":
      return defaultValue
    default:
      throw new Error(`len type error: ${len}`)
  }
}

// Inline helper functions for axis operations
// Optimization: Avoid function call overhead by using ternary directly where possible
function getAxisAttrSize<D extends BaseDom>(n: D, isX: boolean) {
  return isX ? n.attributes.width : n.attributes.height
}

function getAxisPosition<D extends BaseDom>(n: D, isX: boolean) {
  return isX ? n.layoutNode.x : n.layoutNode.y
}

function getAxisSize<D extends BaseDom>(n: D, isX: boolean) {
  return isX ? n.layoutNode.width : n.layoutNode.height
}

function setAxisPosition<D extends BaseDom>(n: D, v: number, isX: boolean) {
  if (isX) {
    n.layoutNode.x = v
  } else {
    n.layoutNode.y = v
  }
}

function setAxisSize<D extends BaseDom>(n: D, v: number, isX: boolean) {
  if (isX) {
    n.layoutNode.width = v
  } else {
    n.layoutNode.height = v
  }
}

/**
 * Compute position value from attribute (left/right/top/bottom)
 * Optimization: Extracted common logic to reduce code duplication
 */
function computePositionValue(
  attrValue: Len | undefined,
  parentPos: number,
  parentSize: number,
  nodeSize: number,
  isEnd: boolean, // true for right/bottom, false for left/top
): number | undefined {
  switch (typeof attrValue) {
    case "number":
      return isEnd
        ? parentPos + parentSize - attrValue - nodeSize
        : parentPos + attrValue
    case "string": {
      const offset = parentSize * parsePercentage(attrValue)
      return isEnd
        ? parentPos + parentSize - nodeSize - offset
        : parentPos + offset
    }
    case "undefined":
      return undefined
    default:
      throw new Error(`position type error: ${attrValue}`)
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
    this.computeNodeSize(this.rootNode)
    this.computeNodeLayout(this.rootNode)
    this.customRenderRoot(this.rootNode)
  }

  /**
   * Compute TLBR positioning for absolute positioned nodes
   * Optimization: Reduced code duplication using computePositionValue helper
   */
  private computedNodeTLBR(node: BaseDom<A, P, E>) {
    const { attributes, layoutNode } = node
    let parent = node.parentNode || node

    // Find non-absolute parent
    while (
      parent.attributes.position === POSITION_ABSOLUTE &&
      parent.parentNode
    ) {
      parent = parent.parentNode
    }

    const parentLayout = parent.layoutNode

    assert(
      !(attributes.left !== undefined && attributes.right !== undefined),
      "absolute position: do not set both left and right",
    )
    assert(
      !(attributes.top !== undefined && attributes.bottom !== undefined),
      "absolute position: do not set both top and bottom",
    )

    // Initialize position to parent position
    layoutNode.x = parentLayout.x
    layoutNode.y = parentLayout.y

    // Compute X position (left or right)
    const leftResult = computePositionValue(
      attributes.left,
      parentLayout.x,
      parentLayout.width,
      layoutNode.width,
      false,
    )
    if (leftResult !== undefined) {
      layoutNode.x = leftResult
    } else {
      const rightResult = computePositionValue(
        attributes.right,
        parentLayout.x,
        parentLayout.width,
        layoutNode.width,
        true,
      )
      if (rightResult !== undefined) {
        layoutNode.x = rightResult
      }
    }

    // Compute Y position (top or bottom)
    const topResult = computePositionValue(
      attributes.top,
      parentLayout.y,
      parentLayout.height,
      layoutNode.height,
      false,
    )
    if (topResult !== undefined) {
      layoutNode.y = topResult
    } else {
      const bottomResult = computePositionValue(
        attributes.bottom,
        parentLayout.y,
        parentLayout.height,
        layoutNode.height,
        true,
      )
      if (bottomResult !== undefined) {
        layoutNode.y = bottomResult
      }
    }
  }

  /**
   * Compute zIndex for node
   * Optimization: Simplified loop, reduced property access
   */
  private computeZIndex(node: BaseDom<A, P, E>): number {
    const nodeZIndex = node.attributes.zIndex
    if (typeof nodeZIndex === "number") {
      return nodeZIndex
    }

    let parent = node.parentNode
    let depth = 1

    while (parent) {
      const parentZIndex = parent.attributes.zIndex
      if (typeof parentZIndex === "number") {
        return parentZIndex + depth
      }
      parent = parent.parentNode
      depth += DEFAULT_ZINDEX_STEP
    }

    return depth
  }

  /**
   * Compute node size along a single axis
   * Optimization: Extracted from computeNodeSize to reduce duplication
   */
  private computeNodeSizeAxis(
    node: BaseDom<A, P, E>,
    v: number | string | undefined,
    isX: boolean,
    extraSize: number,
  ) {
    switch (typeof v) {
      case "number":
        setAxisSize(node, v + extraSize, isX)
        return
      case "string": {
        assert(v.endsWith("%"), "length string must end with %")
        const parentAttrLen = getAxisAttrSize(node.parentNode!, isX)
        assert(
          !(parentAttrLen === "auto" || parentAttrLen === undefined),
          "The parent of a node of relative size cannot be auto or undefined",
        )
        setAxisSize(node, lenToNumber(node, v, isX) + extraSize, isX)
        return
      }
      default:
        throw new Error(`computeNodeSize error, not support length: ${v}`)
    }
  }

  /**
   * Compute node size recursively
   * Optimization:
   * - Cache frequently accessed properties
   * - Reduce redundant calculations
   * - Combine similar code paths
   */
  private computeNodeSize(node: BaseDom<A, P, E>) {
    const { attributes, layoutNode } = node
    const isX = attributes.flexDirection !== FLEX_DIRECTION_ROW

    // Compute and apply zIndex
    this.customComputeZIndex(node, this.computeZIndex(node))

    // Compute padding and border
    const paddingSize = lenToNumber(node, attributes.padding, isX)
    const borderSize = lenToNumber(node, attributes.borderSize, isX)
    layoutNode.padding = paddingSize
    layoutNode.border = borderSize
    const extraSize = (paddingSize + borderSize) * 2

    const xAttr = getAxisAttrSize(node, isX)
    const yAttr = getAxisAttrSize(node, !isX)
    const xIsAuto = xAttr === undefined || xAttr === "auto"
    const yIsAuto = yAttr === undefined || yAttr === "auto"

    // Handle text nodes
    if (typeof attributes.text === "string") {
      const { width, height } = this.customMeasureNode(node)
      layoutNode.width = xIsAuto
        ? extraSize + width
        : extraSize + lenToNumber(node, xAttr, true)
      layoutNode.height = yIsAuto
        ? extraSize + height
        : extraSize + lenToNumber(node, yAttr, false)

      // Process children for text nodes (for offset calculations)
      const children = node.childNodes
      for (let i = 0, len = children.length; i < len; i++) {
        this.computeNodeSize(children[i])
      }
      return
    }

    // Compute fixed dimensions first
    if (!xIsAuto) {
      this.computeNodeSizeAxis(node, xAttr, isX, extraSize)
    }
    if (!yIsAuto) {
      this.computeNodeSizeAxis(node, yAttr, !isX, extraSize)
    }

    // Process children and collect size info
    let maxXAxisLen = 0
    let maxYAxisLen = 0
    let sumXAxisLen = 0

    const children = node.childNodes
    for (let i = 0, len = children.length; i < len; i++) {
      const c = children[i]
      this.computeNodeSize(c)

      if (c.attributes.position !== POSITION_ABSOLUTE) {
        const childXSize = getAxisSize(c, isX)
        const childYSize = getAxisSize(c, !isX)
        if (childXSize > maxXAxisLen) maxXAxisLen = childXSize
        if (childYSize > maxYAxisLen) maxYAxisLen = childYSize
        sumXAxisLen += childXSize
      }
    }

    // Set auto dimensions
    if (xIsAuto) {
      setAxisSize(node, (isX ? sumXAxisLen : maxYAxisLen) + extraSize, true)
    }
    if (yIsAuto) {
      setAxisSize(node, (isX ? maxYAxisLen : sumXAxisLen) + extraSize, false)
    }

    // Handle alignContent stretch
    if (attributes.alignContent === ALIGN_STRETCH) {
      const stretchSize =
        (isX ? layoutNode.height : layoutNode.width) - extraSize
      const stretchAttr = isX ? "height" : "width"
      for (let i = 0, len = children.length; i < len; i++) {
        const c = children[i]
        if (c.attributes[stretchAttr] === undefined) {
          if (isX) {
            c.layoutNode.height = stretchSize
          } else {
            c.layoutNode.width = stretchSize
          }
        }
      }
    }
  }

  /**
   * Compute alignment for flex children with wrap support
   * isX: when flexDirection !== "row", isX = true (main axis = X/width)
   */
  private computedNodeAlign(node: BaseDom<A, P, E>) {
    const { attributes } = node
    const isX = attributes.flexDirection !== FLEX_DIRECTION_ROW
    const justifyContent = attributes.justifyContent || ALIGN_START
    const alignItems = attributes.alignItems || ALIGN_START

    // Filter flex nodes
    const children = node.childNodes
    const flexNodes: BaseDom<A, P, E>[] = []
    for (let i = 0, len = children.length; i < len; i++) {
      const c = children[i]
      if (!skipFlexLayout(c)) {
        flexNodes.push(c)
      }
    }

    const flexCount = flexNodes.length
    if (flexCount === 0) return

    // Reverse for end justification
    if (justifyContent === ALIGN_END) {
      flexNodes.reverse()
    }

    // Pre-compute layout values
    const nodeExtraSize = node.layoutNode.padding + node.layoutNode.border
    const nodeXPos = getAxisPosition(node, isX) + nodeExtraSize
    const nodeYPos = getAxisPosition(node, !isX) + nodeExtraSize
    const nodeXSize = getAxisSize(node, isX) - nodeExtraSize * 2
    const nodeYSize = getAxisSize(node, !isX) - nodeExtraSize * 2
    const nodeXEnd = nodeXPos + nodeXSize
    const nodeYEnd = nodeYPos + nodeYSize

    let xAxisStart = 0
    let yAxisStart = 0
    let maxYAxisSize = 0
    let sumXAxisSize = 0

    // Combined switch on justifyContent + alignItems for optimal performance
    const alignKey = `${justifyContent}_${alignItems}`

    switch (alignKey) {
      case "start_start":
      case "start_space-between": {
        xAxisStart = nodeXPos
        yAxisStart = nodeYPos
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
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
      case "start_end": {
        xAxisStart = nodeXPos
        yAxisStart = nodeYEnd
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
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
      case "start_center": {
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          sumXAxisSize += getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
        }
        xAxisStart = nodeXPos
        yAxisStart = nodeYPos
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          const nextStart = xAxisStart + childXSize
          if (nextStart > nodeXEnd) {
            yAxisStart += maxYAxisSize
            setAxisPosition(c, nodeXPos, isX)
            setAxisPosition(c, yAxisStart, !isX)
            xAxisStart = nodeXPos + childXSize
          } else {
            setAxisPosition(c, xAxisStart, isX)
            setAxisPosition(c, yAxisStart + (nodeYSize - childYSize) / 2, !isX)
            xAxisStart += childXSize
          }
        }
        return
      }
      case "end_start":
      case "end_space-between": {
        xAxisStart = nodeXEnd
        yAxisStart = nodeYPos
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
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
      case "end_end": {
        xAxisStart = nodeXEnd
        yAxisStart = nodeYEnd
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
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
      case "end_center": {
        xAxisStart = nodeXEnd
        yAxisStart = nodeYPos
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
        }
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          const nextStart = xAxisStart - childXSize
          if (nextStart >= nodeXPos) {
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
      case "center_start":
      case "center_space-between": {
        yAxisStart = nodeYPos
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          sumXAxisSize += getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
        }
        xAxisStart = nodeXPos + (nodeXSize - sumXAxisSize) / 2
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const nextStart = xAxisStart + childXSize
          if (nextStart <= nodeXEnd) {
            setAxisPosition(c, xAxisStart, isX)
            setAxisPosition(c, yAxisStart, !isX)
            xAxisStart += childXSize
          }
        }
        return
      }
      case "center_end": {
        yAxisStart = nodeYEnd
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          sumXAxisSize += getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
        }
        xAxisStart = nodeXPos + (nodeXSize - sumXAxisSize) / 2
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          const nextStart = xAxisStart + childXSize
          if (nextStart <= nodeXEnd) {
            setAxisPosition(c, xAxisStart, isX)
            setAxisPosition(c, yAxisStart - childYSize, !isX)
            xAxisStart += childXSize
          }
        }
        return
      }
      case "center_center": {
        yAxisStart = nodeYPos
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          sumXAxisSize += getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          if (childYSize > maxYAxisSize) maxYAxisSize = childYSize
        }
        xAxisStart = nodeXPos + (nodeXSize - sumXAxisSize) / 2
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          const nextStart = xAxisStart + childXSize
          if (nextStart <= nodeXEnd) {
            setAxisPosition(c, xAxisStart, isX)
            setAxisPosition(c, yAxisStart + (nodeYSize - childYSize) / 2, !isX)
            xAxisStart += childXSize
          }
        }
        return
      }
      case "space-between_start":
      case "space-between_space-between": {
        yAxisStart = nodeYPos
        for (let i = 0; i < flexCount; i++) {
          sumXAxisSize += getAxisSize(flexNodes[i], isX)
        }
        xAxisStart = nodeXPos
        const xGap1 =
          flexCount > 1 ? (nodeXSize - sumXAxisSize) / (flexCount - 1) : 0
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const nextStart = xAxisStart + childXSize
          if (nextStart <= nodeXEnd) {
            setAxisPosition(c, xAxisStart, isX)
            setAxisPosition(c, yAxisStart, !isX)
            xAxisStart += childXSize + xGap1
          }
        }
        return
      }
      case "space-between_end": {
        yAxisStart = nodeYEnd
        for (let i = 0; i < flexCount; i++) {
          sumXAxisSize += getAxisSize(flexNodes[i], isX)
        }
        xAxisStart = nodeXPos
        const xGap2 =
          flexCount > 1 ? (nodeXSize - sumXAxisSize) / (flexCount - 1) : 0
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          const nextStart = xAxisStart + childXSize
          if (nextStart <= nodeXEnd) {
            setAxisPosition(c, xAxisStart, isX)
            setAxisPosition(c, yAxisStart - childYSize, !isX)
            xAxisStart += childXSize + xGap2
          }
        }
        return
      }
      case "space-between_center": {
        yAxisStart = nodeYPos
        for (let i = 0; i < flexCount; i++) {
          sumXAxisSize += getAxisSize(flexNodes[i], isX)
        }
        xAxisStart = nodeXPos
        const xGap3 =
          flexCount > 1 ? (nodeXSize - sumXAxisSize) / (flexCount - 1) : 0
        for (let i = 0; i < flexCount; i++) {
          const c = flexNodes[i]
          const childXSize = getAxisSize(c, isX)
          const childYSize = getAxisSize(c, !isX)
          const nextStart = xAxisStart + childXSize
          if (nextStart <= nodeXEnd) {
            setAxisPosition(c, xAxisStart, isX)
            setAxisPosition(c, yAxisStart + (nodeYSize - childYSize) / 2, !isX)
            xAxisStart += childXSize + xGap3
          }
        }
        return
      }
    }

    throw new Error(`not support flex align: ${justifyContent} ${alignItems}`)
  }

  /**
   * Compute node layout recursively
   * Optimization: Simplified switch, reduced redundant checks
   */
  private computeNodeLayout(node: BaseDom<A, P, E>) {
    const { layoutNode, attributes } = node

    if (hasTLBR(node)) {
      this.computedNodeTLBR(node)
    }

    // Apply explicit x/y positioning
    if (typeof attributes.x === "number") {
      layoutNode.x = attributes.x
    }
    if (typeof attributes.y === "number") {
      layoutNode.y = attributes.y
    }

    // Compute flex alignment if needed
    const hasChildren = node.childNodes.length > 0
    const isFlex = attributes.display === DISPLAY_FLEX

    if (hasChildren && isFlex) {
      const pos = attributes.position
      if (
        pos === undefined ||
        pos === POSITION_RELATIVE ||
        pos === POSITION_ABSOLUTE
      ) {
        this.computedNodeAlign(node)
      }
    }

    // Recursively process children
    const children = node.childNodes
    for (let i = 0, len = children.length; i < len; i++) {
      this.computeNodeLayout(children[i])
    }
  }

  /**
   * Dispatch mouse event to node tree
   * Optimization: Pre-allocate dispatch map arrays
   */
  private dispatchMouseEventInner(
    node: BaseDom<A, P, E>,
    event: BaseMouseEvent<A, P, E>,
    dispatchMap: Record<EventName, BaseDom<A, P, E>[]>,
  ) {
    const attr = node.attributes
    if (attr.hide || attr.pointerEvents === "none") {
      return
    }

    const children = node.childNodes
    for (let i = 0, len = children.length; i < len; i++) {
      this.dispatchMouseEventInner(children[i], event, dispatchMap)
    }

    this.dispatchMouseEventForNode(node, event, dispatchMap)
  }

  /**
   * Main mouse event dispatch entry point
   * Optimization: Use for loop instead of for-of, sort only non-empty arrays
   */
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

    // Process events by name
    for (let i = 0, len = EventNameList.length; i < len; i++) {
      const name = EventNameList[i]
      const nodes = dm[name]
      const nodeCount = nodes.length

      if (nodeCount === 0) continue

      // Sort by zIndex descending (higher zIndex first)
      if (nodeCount > 1) {
        nodes.sort(
          (a, b) => (b.attributes.zIndex || 0) - (a.attributes.zIndex || 0),
        )
      }

      for (let j = 0; j < nodeCount; j++) {
        if (!event.bubbles) continue

        const n = nodes[j]
        // Special handling for enter/leave events
        if (name === "onMouseLeave" || name === "onMouseEnter") {
          event.target = n
        }

        const handler = n.attributes[name]
        if (handler) {
          handler(event)
        }
      }
    }
  }

  /**
   * Handle mouse event for a single node
   * Optimization:
   * - Early returns for common cases
   * - Cache property access
   * - Use switch for event type detection
   */
  private dispatchMouseEventForNode(
    node: BaseDom<A, P, E>,
    event: BaseMouseEvent<A, P, E>,
    dispatchMap: Record<EventName, BaseDom<A, P, E>[]>,
  ) {
    if (!event.bubbles) return

    const attr = node.attributes
    if (attr.pointerEvents === "none" || attr.hide) return

    const layoutNode = node.layoutNode
    const isInside = layoutNode.hasPoint(event.x, event.y)

    if (isInside) {
      if (event.target === undefined) {
        event.target = node
      }

      if (!event.hover) {
        // Mouse left the window while inside node
        if (layoutNode._mouseIn) {
          dispatchMap.onMouseLeave.push(node)
          layoutNode._mouseIn = false
        }
        return
      }

      // Handle wheel events first (most specific)
      if (this.customIsWheelDown(event)) {
        dispatchMap.onWheelDown.push(node)
        return
      }
      if (this.customIsWheelUp(event)) {
        dispatchMap.onWheelUp.push(node)
        return
      }

      // Handle mouse press (drag)
      if (this.customIsMousePress(event)) {
        if (layoutNode._mouseDown) {
          dispatchMap.onMousePress.push(node)
        } else if (!layoutNode._mouseIn) {
          dispatchMap.onMouseEnter.push(node)
          layoutNode._mouseIn = true
        } else {
          dispatchMap.onMouseMove.push(node)
        }
        return
      }

      // Handle mouse down / click
      const isMouseDown = this.customIsMouseDown(event)
      const isMouseClick = this.customIsMouseClick(event)

      if (!layoutNode._mouseDown && (isMouseDown || isMouseClick)) {
        dispatchMap.onMouseDown.push(node)
        dispatchMap.onClick.push(node)
        layoutNode._mouseDown = true
        layoutNode._mouseUp = false

        if (!layoutNode._focus) {
          layoutNode._focus = true
          dispatchMap.onFocus.push(node)
        }

        if (isMouseClick) {
          layoutNode._mouseDown = false
          dispatchMap.onMouseUp.push(node)
        }
        return
      }

      // Handle mouse up
      if (this.customIsMouseUp(event) && !layoutNode._mouseUp) {
        dispatchMap.onMouseUp.push(node)
        layoutNode._mouseDown = false
        layoutNode._mouseUp = true

        if (!layoutNode._focus) {
          dispatchMap.onFocus.push(node)
          layoutNode._focus = true
        }
      }
    } else {
      // Mouse is outside node
      if (layoutNode._mouseIn) {
        dispatchMap.onMouseLeave.push(node)
        layoutNode._mouseIn = false
      }

      // Handle blur on click outside
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
