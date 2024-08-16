import { drawBorder, drawRect } from "@mpv-easy/assdraw"
import {
  getAssScale,
  parsePercentage,
  type MousePos,
  type KeyEvent,
  Rect,
  print,
  fileInfo,
  Overlay,
} from "@mpv-easy/tool"
import {
  BaseDom,
  Flex,
  BaseMouseEvent,
  isDirty,
  markClean,
  getFirstValidAttribute,
} from "@r-tui/flex"
import type { Shape } from "@r-tui/share"
import {
  type MpDom,
  createNode,
  type MpAttrs,
  type MpProps,
  MpEvent,
} from "./dom"
import { getAssText, measureText } from "./common"

export type RenderConfig = {
  flex: MpFlex
  enableMouseMoveEvent: boolean
  fps: number
  customRender: () => void
  customDispatch: (
    node: MpDom,
    pos: MousePos,
    event: KeyEvent,
    mouseEvent?: MouseEvent,
  ) => void
  showFps?: boolean
}

const RootName = "@mpv-easy/root"
const BoxName = "@mpv-easy/box"
let RootNode: MpDom

export const getRootNode = () => {
  if (RootNode) return RootNode
  RootNode = createNode(RootName)
  return RootNode
}

export const DefaultFps = 30

function renderNodeToMpv(node: MpDom) {
  const hide = getFirstValidAttribute(node, "hide") ?? false
  const {
    props: {
      osdOverlays: [textOverlay, bgOverlay, borderOverlay],
    },
    layoutNode,
    attributes,
  } = node

  const dirty = isDirty(node)

  if (hide) {
    if (layoutNode._hideCache) {
      return
    }
    layoutNode._hideCache = true
    for (const ovl of node.props.osdOverlays) {
      ovl.hidden = true
      ovl.computeBounds = false
      ovl.update()
    }
    if (
      typeof attributes.backgroundImage === "string" &&
      node.props.imageOverlay
    ) {
      node.props.imageOverlay?.remove()
    }
  } else if (node.props.nodeName === "@mpv-easy/box") {
    layoutNode._hideCache = false
    const assScale = getAssScale()
    let {
      backgroundColor,
      borderSize,
      borderColor = "#FFFFFFFF",
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

    if (borderColor.length === 7) {
      borderColor += "00"
    }

    if (typeof borderSize === "string") {
      borderSize = layoutNode.width * parsePercentage(borderSize)
    }

    const { x, y, width, height } = layoutNode

    // border ovl

    if (typeof borderSize !== "undefined") {
      if (dirty) {
        borderOverlay.data = drawBorder({
          x: x * assScale,
          y: y * assScale,
          width: width * assScale,
          height: height * assScale,
          borderColor,
          borderSize: borderSize * assScale,
        })
      }
      borderOverlay.hidden = false
      borderOverlay.computeBounds = false
      borderOverlay.hidden = false
      borderOverlay.update()
    }

    borderSize = borderSize || 0

    // text ovl
    const hasText = typeof attributes.text !== "undefined"
    if (hasText) {
      if (dirty) {
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
              `text layout not support: justifyContent ${justifyContent} alignItems ${alignItems}`,
            )
          }
        }
        textOverlay.data = getAssText(node, textX * assScale, textY * assScale)
      }
      textOverlay.hidden = false
      textOverlay.computeBounds = true
    }
    const textRect = textOverlay.update(1 / assScale)

    // bg ovl
    if (typeof backgroundColor !== "undefined") {
      if (backgroundColor.length === 7) {
        backgroundColor += "00"
      }

      let bgX = x
      let bgY = y
      let bgW = width
      let bgH = height
      if (hasText && node.parentNode?.attributes.alignContent !== "stretch") {
        bgX = textRect.x
        bgY = textRect.y
        bgW = textRect.width
        bgH = textRect.height
      }
      const rect = new Rect(
        bgX + borderSize + paddingSize,
        bgY + borderSize + paddingSize,
        bgW - 2 * borderSize - 2 * paddingSize,
        bgH - 2 * borderSize - 2 * paddingSize,
      )
      if (dirty) {
        const bgData = drawRect({
          ...rect.scale(assScale),
          color: backgroundColor,
          borderRadius: borderRadiusSize * assScale,
        })
        bgOverlay.data = bgData
      }
      bgOverlay.hidden = false
      bgOverlay.update()
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

      if (!node.props.imageOverlay) {
        node.props.imageOverlay = new Overlay(id)
      }
      const overlay = node.props.imageOverlay

      backgroundImage = backgroundImage.split("?")[0]
      const info = fileInfo(backgroundImage)
      if (!info) {
        // throw new Error("backgroundImage file not found")
        print(`backgroundImage file not found: ${backgroundImage}`)
      } else {
        const { size } = info
        const pixels = w * h * 4
        if (pixels !== size) {
          print(`backgroundImage size error: ${w}-${h}-${size}`)
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
}

function renderRootToMpv(node: MpDom) {
  for (const c of node.childNodes) {
    renderRootToMpv(c)
    renderNodeToMpv(c)
  }
  renderNodeToMpv(node)
  markClean(node)
}

export class MpFlex extends Flex<MpAttrs, MpProps, MpEvent> {
  customCreateMouseEvent(
    node: BaseDom<MpAttrs, MpProps, MpEvent> | undefined,
    x: number,
    y: number,
    hover: boolean,
    event: MpEvent,
  ): BaseMouseEvent<MpAttrs, MpProps, MpEvent> {
    return new BaseMouseEvent(node, x, y, hover, event)
  }
  customIsWheelDown(e: BaseMouseEvent<MpAttrs, MpProps, MpEvent>): boolean {
    return e.event.key_name === "WHEEL_DOWN"
  }
  customIsWheelUp(e: BaseMouseEvent<MpAttrs, MpProps, MpEvent>): boolean {
    return e.event.key_name === "WHEEL_UP"
  }
  customIsMousePress(e: BaseMouseEvent<MpAttrs, MpProps, MpEvent>): boolean {
    return e.event.event === "press"
  }
  customIsMouseDown(e: BaseMouseEvent<MpAttrs, MpProps, MpEvent>): boolean {
    return e.event.event === "down"
  }
  customIsMouseUp(e: BaseMouseEvent<MpAttrs, MpProps, MpEvent>): boolean {
    return e.event.event === "up"
  }
  constructor(config: Partial<RenderConfig> = {}) {
    super()
    // TODO: abstract method not work?
    // console.log("rootNode1", this.rootNode)
    this.rootNode = getRootNode()
    // console.log("rootNode2", this.rootNode)
  }

  customCreateNode(): MpDom {
    return createNode(BoxName)
  }
  customIsRootNode(node: MpDom): boolean {
    return node.props.nodeName === RootName
  }
  customCreateRootNode(): MpDom {
    return getRootNode()
  }
  customRenderRoot(node: MpDom): void {
    renderRootToMpv(node)
  }
  customComputeZIndex(node: MpDom, zIndex: number): void {
    const {
      props: {
        osdOverlays: [textOverlay, bgOverlay, borderOverlay],
      },
    } = node
    textOverlay.z = zIndex + 3
    bgOverlay.z = zIndex + 2
    borderOverlay.z = zIndex + 1
  }
  customMeasureNode(node: MpDom): Shape {
    return measureText(node)
  }
}

let RootFlex: MpFlex

export function getRootFlex(confgi: Partial<RenderConfig> = {}) {
  if (RootFlex) return RootFlex
  return (RootFlex = new MpFlex(confgi))
}

export const dispatchEvent = (node: MpDom, pos: MousePos, event: KeyEvent) => {
  const e = getRootFlex().customCreateMouseEvent(
    node,
    pos.x,
    pos.y,
    pos.hover,
    event,
  )
  getRootFlex().dispatchMouseEvent(node, e)
}

export const renderNode = () => {
  getRootFlex().renderRoot()
}
