import { BaseDom, BaseMouseEvent, EventName, EventNameList } from "./dom"
import { type Shape } from "./shape"
import { assert } from "./assert"
import { isPercentage, parsePercentage } from "./number"
import { Len } from "./type"

function hasTLBR<D extends BaseDom>(node: D): boolean {
  return (
    typeof node.attributes.top !== "undefined" ||
    typeof node.attributes.left !== "undefined" ||
    typeof node.attributes.bottom !== "undefined" ||
    typeof node.attributes.right !== "undefined"
  )
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

/**
 * Resolve a position offset (left/right/top/bottom) for absolute-positioned nodes.
 * Handles both numeric and percentage values.
 */
function resolveOffset(
  parentSize: number,
  attr: Len | undefined,
): number | undefined {
  switch (typeof attr) {
    case "number":
      return attr
    case "string":
      return parentSize * parsePercentage(attr)
    case "undefined":
      return undefined
    default:
      throw new Error(`offset type error: ${attr}`)
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
   * Resolve absolute positioning for a single axis (X or Y).
   * Handles start (left/top) and end (right/bottom) attributes.
   */
  private resolveAxisTLBR(
    node: BaseDom<A, P, E>,
    parent: BaseDom<A, P, E>,
    startAttr: Len | undefined,
    endAttr: Len | undefined,
    isX: boolean,
  ) {
    const parentPos = getAxisPosition(parent, isX)
    const parentSize = getAxisSize(parent, isX)

    assert(
      !(startAttr !== undefined && endAttr !== undefined),
      `absolute position: do not set both ${isX ? "left" : "top"} and ${isX ? "right" : "bottom"}`,
    )

    // Default: inherit parent position
    setAxisPosition(node, parentPos, isX)

    const startOffset = resolveOffset(parentSize, startAttr)
    if (startOffset !== undefined) {
      setAxisPosition(node, parentPos + startOffset, isX)
      return
    }

    const endOffset = resolveOffset(parentSize, endAttr)
    if (endOffset !== undefined) {
      const nodeSize = getAxisSize(node, isX)
      setAxisPosition(node, parentPos + parentSize - endOffset - nodeSize, isX)
    }
  }

  /**
   * Compute absolute positioning for nodes with top/left/bottom/right attributes.
   * Refactored: unified X and Y handling via resolveAxisTLBR to eliminate
   * duplicated switch-case blocks for each direction.
   */
  private computedNodeTLBR(node: BaseDom<A, P, E>) {
    const { attributes } = node
    let parent = node.parentNode ? node.parentNode : node
    while (parent && parent.attributes.position === "absolute") {
      parent = parent.parentNode!
    }

    this.resolveAxisTLBR(node, parent, attributes.left, attributes.right, true)
    this.resolveAxisTLBR(node, parent, attributes.top, attributes.bottom, false)
  }

  /**
   * Compute z-index for a node by walking up the tree.
   * Fixed: original implementation had confusing control flow that could
   * potentially hang. Simplified to a clean upward traversal.
   */
  private computeZIndex(node: BaseDom<A, P, E>): number {
    if (typeof node.attributes.zIndex === "number") {
      return node.attributes.zIndex
    }
    let parent = node.parentNode
    let depth = 1
    while (parent) {
      if (typeof parent.attributes.zIndex === "number") {
        return parent.attributes.zIndex + depth
      }
      depth += defaultZIndexStep
      parent = parent.parentNode
    }
    return depth
  }

  /**
   * Compute the size of a single axis from an explicit attribute value.
   */
  private computeNodeSizeAxis(
    node: BaseDom<A, P, E>,
    v: number | string | undefined,
    isX: boolean,
    extraSize: number,
  ) {
    switch (typeof v) {
      case "number": {
        setAxisSize(node, v + extraSize, isX)
        return
      }
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
    }
    throw new Error(`computeNodeSize error, not support length: ${v}`)
  }

  /**
   * Apply alignContent: stretch to children along the cross axis.
   * Extracted from computeNodeSize to eliminate duplicated blocks.
   */
  private applyAlignContentStretch(
    node: BaseDom<A, P, E>,
    isX: boolean,
    extraSize: number,
  ) {
    if (node.attributes.alignContent !== "stretch") return
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

  /**
   * Recursively compute intrinsic sizes for all nodes.
   * Refactored: consolidated branching and extracted alignContent:stretch
   * into a shared helper to eliminate duplicated code.
   */
  private computeNodeSize(node: BaseDom<A, P, E>) {
    const { attributes, layoutNode } = node

    // isX: true when main axis is horizontal (X). Matches CSS semantics:
    //   "row" (default) → horizontal main axis (isX = true)
    //   "column"        → vertical main axis  (isX = false)
    const isX = attributes.flexDirection !== "column"

    const zIndex = this.computeZIndex(node)
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

    // Text nodes: measure text content and size independently of children
    if (typeof attributes.text === "string") {
      const { width, height } = this.customMeasureNode(node)

      // xIsAuto/yIsAuto refer to main/cross axis attrs, not literal width/height.
      // Map text measurement dimensions via isX to set the correct axis.
      const mainTextSize = isX ? width : height
      const crossTextSize = isX ? height : width

      setAxisSize(
        node,
        xIsAuto
          ? extraSize + mainTextSize
          : extraSize + lenToNumber(node, xAttr, isX),
        isX,
      )
      setAxisSize(
        node,
        yIsAuto
          ? extraSize + crossTextSize
          : extraSize + lenToNumber(node, yAttr, !isX),
        !isX,
      )

      // The size of the text node is not affected by its child nodes
      // making it convenient for calculating offsets in child nodes.
      for (const c of node.childNodes) {
        this.computeNodeSize(c)
      }
      return
    }

    // Set explicit axis sizes first
    if (!xIsAuto) {
      this.computeNodeSizeAxis(node, xAttr, isX, extraSize)
    }
    if (!yIsAuto) {
      this.computeNodeSizeAxis(node, yAttr, !isX, extraSize)
    }

    // Iterate children: always needed for recursive size computation
    // and for measuring auto-sized axes
    let maxXAxisLen = 0
    let maxYAxisLen = 0
    let sumXAxisLen = 0

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
    }

    // Compute auto-sized axes from children
    // xIsAuto = main axis attr is auto → size = sum of children's main sizes
    // yIsAuto = cross axis attr is auto → size = max of children's cross sizes
    if (xIsAuto) {
      setAxisSize(node, sumXAxisLen + extraSize, isX)
    }
    if (yIsAuto) {
      setAxisSize(node, maxYAxisLen + extraSize, !isX)
    }

    // Apply alignContent: stretch (single shared call, was duplicated before)
    this.applyAlignContentStretch(node, isX, extraSize)
  }

  /**
   * Unified alignment computation for flex children.
   *
   * Refactored from ~400 lines (12 separate justifyContent×alignItems branches)
   * into a single parameterized flow:
   *   1. Pre-compute sumMainSize, maxCrossSize
   *   2. Compute mainStart and gap based on justifyContent
   *   3. Single positioning loop with cross-axis offset based on alignItems
   *
   * Performance: avoids filter() array allocation and reverse() mutation
   * by using in-place iteration with a direction flag.
   */
  private computedNodeAlign(node: BaseDom<A, P, E>) {
    const { attributes } = node
    const isX = attributes.flexDirection !== "column"

    const { justifyContent = "start", alignItems = "start" } = attributes

    const nodeExtraSize = node.layoutNode.padding + node.layoutNode.border
    const nodeMainPos = getAxisPosition(node, isX) + nodeExtraSize
    const nodeCrossPos = getAxisPosition(node, !isX) + nodeExtraSize
    const nodeMainSize = getAxisSize(node, isX) - nodeExtraSize * 2
    const nodeCrossSize = getAxisSize(node, !isX) - nodeExtraSize * 2
    const nodeMainEnd = nodeMainPos + nodeMainSize

    // Pre-compute aggregate metrics (single pass over children)
    let sumMainSize = 0
    let maxCrossSize = 0
    let flexCount = 0

    for (const c of node.childNodes) {
      if (skipFlexLayout(c)) continue
      sumMainSize += getAxisSize(c, isX)
      maxCrossSize = Math.max(maxCrossSize, getAxisSize(c, !isX))
      flexCount++
    }

    if (flexCount === 0) return

    // Determine iteration direction: "end" justification reverses traversal
    const isReverse = justifyContent === "end"

    // Compute main-axis start position based on justifyContent
    let mainCursor: number
    switch (justifyContent) {
      case "start":
        mainCursor = nodeMainPos
        break
      case "end":
        mainCursor = nodeMainEnd
        break
      case "center":
        mainCursor = nodeMainPos + (nodeMainSize - sumMainSize) / 2
        break
      case "space-between": {
        mainCursor = nodeMainPos
        break
      }
      default:
        throw new Error(`not support justifyContent: ${justifyContent}`)
    }

    // Compute gap for space-between
    const gap =
      justifyContent === "space-between" && flexCount > 1
        ? (nodeMainSize - sumMainSize) / (flexCount - 1)
        : 0

    // Compute cross-axis position for a child based on alignItems.
    // crossBase: the starting cross-axis position of the current line.
    // crossExtent: the cross-axis size to align within:
    //   - nodeCrossSize for single-line (non-wrapped) items
    //   - lineMaxCross for wrapped items (per-line alignment)
    const computeCrossPos = (
      childCrossSize: number,
      crossBase: number,
      crossExtent: number,
    ): number => {
      switch (alignItems) {
        case "start":
        case "space-between":
          return crossBase
        case "end":
          return crossBase + crossExtent - childCrossSize
        case "center":
          return crossBase + (crossExtent - childCrossSize) / 2
        default:
          throw new Error(`not support alignItems: ${alignItems}`)
      }
    }

    // Track wrapping state
    let crossCursor = nodeCrossPos
    let lineMaxCross = 0

    // Position each flex child
    const childNodes = node.childNodes
    const len = childNodes.length

    // Iterate in forward or reverse order based on justification
    for (let idx = 0; idx < len; idx++) {
      const i = isReverse ? len - 1 - idx : idx
      const c = childNodes[i]
      if (skipFlexLayout(c)) continue

      const childMainSize = getAxisSize(c, isX)
      const childCrossSize = getAxisSize(c, !isX)
      lineMaxCross = Math.max(lineMaxCross, childCrossSize)

      if (isReverse) {
        // Reverse: cursor moves backward from end
        const nextCursor = mainCursor - childMainSize

        if (nextCursor < nodeMainPos) {
          // Wrap to next line — align within line extent
          crossCursor += lineMaxCross
          mainCursor = nodeMainEnd
          setAxisPosition(c, mainCursor - childMainSize, isX)
          setAxisPosition(
            c,
            computeCrossPos(childCrossSize, crossCursor, lineMaxCross),
            !isX,
          )
          mainCursor -= childMainSize
        } else {
          setAxisPosition(c, nextCursor, isX)
          setAxisPosition(
            c,
            computeCrossPos(childCrossSize, crossCursor, nodeCrossSize),
            !isX,
          )
          mainCursor = nextCursor
        }
      } else {
        // Forward: cursor moves forward from start
        const nextEnd = mainCursor + childMainSize

        if (nextEnd > nodeMainEnd && justifyContent !== "space-between") {
          // Wrap to next line — align within line extent
          crossCursor += lineMaxCross
          mainCursor = nodeMainPos
          setAxisPosition(c, mainCursor, isX)
          setAxisPosition(
            c,
            computeCrossPos(childCrossSize, crossCursor, lineMaxCross),
            !isX,
          )
          mainCursor += childMainSize
        } else {
          setAxisPosition(c, mainCursor, isX)
          setAxisPosition(
            c,
            computeCrossPos(childCrossSize, crossCursor, nodeCrossSize),
            !isX,
          )
          mainCursor += childMainSize + gap
        }
      }
    }
  }

  private computeNodeLayout(node: BaseDom<A, P, E>) {
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
      case "relative":
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
        } else if (
          !layoutNode._mouseDown &&
          (this.customIsMouseDown(event) || this.customIsMouseClick(event))
        ) {
          if (!layoutNode._mouseDown) {
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
