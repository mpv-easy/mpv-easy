import { drawBorder, drawRect } from "@mpv-easy/assdraw"
import {
  getAssScale,
  parsePercentage,
  type MousePos,
  type KeyEvent,
  Rect,
  fileInfo,
  Overlay,
} from "@mpv-easy/tool"
import {
  BaseDom,
  Flex,
  BaseMouseEvent,
  getFirstValidAttribute,
} from "@mpv-easy/flex"
import type { Shape } from "@mpv-easy/flex"
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
  throttle: boolean
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
  maxFpsFrame?: number
  frameLimit?: number
  mouseKeyBinding?: boolean
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

    if (
      typeof borderSize !== "undefined" &&
      !(borderColor.length > 7 && borderColor.slice(-2) === "FF")
    ) {
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

    // text ovl
    const hasText =
      typeof attributes.text !== "undefined" ||
      typeof attributes.draw !== "undefined"
    if (hasText) {
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
      const text = getAssText(node, textX, textY, assScale)
      textOverlay.data = text
      textOverlay.hidden = false
      textOverlay.computeBounds = true
    }
    const _textRect = textOverlay.update(1 / assScale)

    // bg ovl
    if (
      typeof backgroundColor !== "undefined" &&
      !(backgroundColor.length > 7 && backgroundColor.slice(-2) === "FF")
    ) {
      if (backgroundColor.length === 7) {
        backgroundColor += "00"
      }

      // const bgX = x
      // const bgY = y
      // const bgW = width
      // const bgH = height
      // if (hasText && node.parentNode?.attributes.alignContent === "stretch") {
      //   bgX = textRect.x
      //   bgY = textRect.y
      //   bgW = textRect.width
      //   bgH = textRect.height
      // }
      // const rect = new Rect(
      //   bgX + borderSize + paddingSize,
      //   bgY + borderSize + paddingSize,
      //   bgW - 2 * borderSize - 2 * paddingSize,
      //   bgH - 2 * borderSize - 2 * paddingSize,
      // )
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
    } else {
      bgOverlay.data = ""
      bgOverlay.hidden = true
      bgOverlay.update()
    }

    // image
    if (typeof backgroundImage === "string" && !hide) {
      const dh = attributes.height || attributes.imageHeight
      const dw = attributes.width || attributes.imageWidth
      const iw = attributes.imageWidth || dw
      const ih = attributes.imageHeight || dh
      const id = attributes.id

      if (typeof id !== "number" || id < 0 || id > 63) {
        throw new Error("backgroundImage'id must be a number in [0, 63]")
      }
      if (
        typeof dw !== "number" ||
        typeof dh !== "number" ||
        typeof iw !== "number" ||
        typeof ih !== "number"
      ) {
        throw new Error(
          "backgroundImage's width/imageWidth and height/imageHeight must be number",
        )
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
        const pixels = iw * ih * 4
        if (pixels !== size) {
          print(`backgroundImage size error: ${iw}-${ih}-${size}`)
        } else {
          overlay.x = x | 0
          overlay.y = y | 0
          overlay.file = backgroundImage
          overlay.fmt = backgroundImageFormat
          overlay.w = iw
          overlay.h = ih
          overlay.offset = 0
          overlay.stride = (iw | 0) << 2
          overlay.dw = dw
          overlay.dh = dh
          overlay.update()
        }
      }
    }
  }
}

function renderRootToMpv(node: MpDom) {
  renderNodeToMpv(node)
  for (const c of node.childNodes) {
    renderRootToMpv(c)
  }
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
  customIsMouseClick(e: BaseMouseEvent<MpAttrs, MpProps, MpEvent>): boolean {
    // FIXME: custom mouse click event
    return e.event.arg === "click"
  }
  constructor(_config: Partial<RenderConfig> = {}) {
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

export function getRootFlex(config: Partial<RenderConfig> = {}) {
  if (RootFlex) return RootFlex
  return (RootFlex = new MpFlex(config))
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
