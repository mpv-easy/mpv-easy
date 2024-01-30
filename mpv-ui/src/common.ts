import { AssDraw } from "@mpv-easy/assdraw"
import { Overlay, Rect, getAssScale, isPercentage } from "@mpv-easy/tool"
import { DOMElement, setAttribute } from "./render/dom"
import { Len } from "./type"
import { lenToNumber } from "./render/flex"
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

export function getAssText(node: DOMElement, x: number, y: number) {
  const { text = "" } = node.attributes
  const assScale = getAssScale()
  const font = readAttr(node, "font") ?? ""
  const color = readAttr(node, "color") ?? "FFFFFF"
  const fontSize = readAttr(node, "fontSize") ?? "5%"
  const fontBorderSize = readAttr(node, "fontBorderSize") ?? 0
  const fontBorderColor = readAttr(node, "fontBorderColor") ?? "000000"
  return new AssDraw()
    .pos(x, y)
    .font(font)
    .fontSize(lenToNumber(node, fontSize, false, 32) * assScale)
    .fontBorderColor(fontBorderColor)
    .fontBorderSize(lenToNumber(node, fontBorderSize, false, 0) * assScale)
    .color(color)
    .append(text)
    .toString()
}

let _measureOverlay: Overlay
const _measureCache: Record<string, Rect> = {}
export function measureText(node: DOMElement): Rect {
  const { layoutNode } = node
  const assScale = getAssScale()
  const offsetX = 0 * assScale
  const offsetY = 0 * assScale
  const textCache = getAssText(node, offsetX, offsetY)

  // if (_measureCache[textCache]) {
  //   return _measureCache[textCache]
  // }

  if (!_measureOverlay) {
    _measureOverlay = new Overlay({
      computeBounds: true,
      hidden: true,
    })
  }

  _measureOverlay.data = textCache

  const { width, height, x, y } = _measureOverlay.update(1 / assScale)
  const dx = x - offsetX
  const dy = y - offsetY
  const rect = new Rect(offsetX, offsetY, width + dx, height + dy)
  layoutNode.textRect.width = rect.width
  layoutNode.textRect.height = rect.height
  // _measureCache[textCache] = layoutNode.textRect
  // return _measureCache[textCache]
  return layoutNode.textRect
}

export function isEvent(name: string) {
  return name[0] === "o" && name[1] === "n"
}
export function applyProps(node: DOMElement, props: any) {
  for (const name in props) {
    if (!propsToSkip[name as keyof typeof propsToSkip])
      setAttribute(node, name, props[name])
  }
}
