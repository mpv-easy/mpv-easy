import { AssDraw } from "@mpv-easy/assdraw"
import { OsdOverlay, Rect, getAssScale, isPercentage } from "@mpv-easy/tool"
import { lenToNumber, setAttribute } from "@r-tui/flex"
import type { MpDom } from "./render/dom"
import type { Shape } from "@r-tui/share"
export const propsToSkip = {
  children: true,
  ref: true,
  key: true,
  style: true,
  forwardedRef: true,
  unstable_applyCache: true,
  unstable_applyDrawHitFromCache: true,
  className: true,
}

export function readAttr(node: any, attrName: string) {
  while (node && typeof node.attributes[attrName] === "undefined") {
    if (node.parentNode) {
      node = node.parentNode
    } else {
      return undefined
    }
  }
  return node.attributes[attrName]
}

export function getAssText(node: MpDom, x: number, y: number) {
  const { text = "" } = node.attributes
  const assScale = getAssScale()
  const font = readAttr(node, "font") ?? ""
  let color = readAttr(node, "color") ?? "FFFFFFFF"
  const fontSize = readAttr(node, "fontSize") ?? "5%"
  const fontBorderSize = readAttr(node, "fontBorderSize") ?? 0
  const fontBorderColor = readAttr(node, "fontBorderColor") ?? "000000"
  let alpha = "FF"
  if (color.length === 6) {
    alpha = "00"
  }
  if (color.length === 8) {
    alpha = color.slice(6, 8)
    color = color.slice(0, 6)
  }
  return new AssDraw()
    .pos(x, y)
    .font(font)
    .fontSize(lenToNumber(node, fontSize, false, 32) * assScale)
    .fontBorderColor(fontBorderColor)
    .fontBorderSize(lenToNumber(node, fontBorderSize, false, 0) * assScale)
    .color(color)
    .alpha(alpha)
    .append(text)
    .toString()
}

let _measureOverlay: OsdOverlay
const _measureCache: Record<string, Shape> = {}
export function measureText(node: MpDom): Shape {
  const { layoutNode } = node
  const assScale = getAssScale()
  const textCache = getAssText(node, 0, 0)
  if (_measureCache[textCache]) {
    return _measureCache[textCache]
  }

  if (!_measureOverlay) {
    _measureOverlay = new OsdOverlay({
      computeBounds: true,
      hidden: true,
    })
  }

  _measureOverlay.data = textCache
  const { width, height } = _measureOverlay.update(1 / assScale)
  layoutNode.textRect.width = width
  layoutNode.textRect.height = height
  _measureCache[textCache] = { width, height }
  return _measureCache[textCache]
}

// export function isEvent(name: string) {
//   return name[0] === "o" && name[1] === "n"
// }
// export function applyProps(node: MpDom, props: any) {
//   for (const name in props) {
//     if (!propsToSkip[name as keyof typeof propsToSkip])
//       setAttribute(node, name, props[name])
//   }
// }
