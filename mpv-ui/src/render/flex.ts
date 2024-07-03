import { drawBorder, drawRect } from "@mpv-easy/assdraw"
import {
  getAssScale,
  assert,
  parsePercentage,
  type MousePos,
  type KeyEvent,
  Rect,
  isPercentage,
  print,
  fileInfo,
  Overlay,
} from "@mpv-easy/tool"
import {
  Flex,
  type LayoutNode,
  type BaseDom,
  type BaseMouseEvent,
} from "@r-tui/flex"
import type { Shape } from "@r-tui/share"
import { type MpDom, createNode, type MpAttrs, type MpProps } from "./dom"
import { getAssText, measureText, readAttr } from "../common"

const RootName = "@mpv-easy/root"
const BoxName = "@mpv-easy/box"
const RootNode: MpDom = createNode(RootName)

import throttle from "lodash-es/throttle"

export const getRootNode = () => {
  return RootNode
}

export const DefaultFps = 30

export class MpFlex extends Flex<MpAttrs, {}, MpProps> {
  customCreateMouseEvent(
    node: MpDom | undefined,
    x: number,
    y: number,
  ): BaseMouseEvent<MpAttrs, {}, MpProps> {
    return {
      target: node,
      x,
      y,
      bubbles: true,
      defaultPrevented: false,
      get offsetX() {
        return this.x - (this.target?.layoutNode.x || 0)
      },
      get offsetY() {
        return this.y - (this.target?.layoutNode.y || 0)
      },
      stopPropagation() {
        this.defaultPrevented = true
      },
      clientX: 0,
      clientY: 0,
      preventDefault() {
        this.defaultPrevented = true
      },
    }
  }

  // renderToMpv: () => void = throttle(
  //   () => {
  //     print('renderToMpv1:')
  //     this.rerender()
  //   },
  //   1000 / DefaultFps,
  //   {
  //     trailing: true,
  //     leading: true,
  //   },
  // )
  renderToMpv() {
    print("renderToMpv1: ")
    this.rerender()
  }

  customCreateNode(): MpDom {
    return createNode(BoxName)
  }
  customIsRootNode(node: MpDom): boolean {
    return node.props.nodeName === RootName
    // return RootNode
  }
  rootNode: MpDom = RootNode
  customCreateRootNode(): MpDom {
    // console.log("customCreateRootNode:", this.rootNode)
    // return createNode(RootName)
    return RootNode
  }
  customRenderNode(node: MpDom): void {
    const hide = readAttr(node, "hide") ?? false
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
      // print("customRenderNode222:", node.attributes.text)
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
              `text layout not support: justifyContent ${justifyContent} alignItems ${alignItems}`,
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

        if (!node.props.imageOverlay) {
          node.props.imageOverlay = new Overlay(id)
        }
        const overlay = node.props.imageOverlay

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

export const RootFlex = new MpFlex()
export const dispatchEvent = (node: MpDom, pos: MousePos, event: KeyEvent) =>
  RootFlex.dispatchEvent(node, pos, event)

export const renderNode = () => {
  RootFlex.renderToMpv()
}
