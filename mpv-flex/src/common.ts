import { AssDraw } from "@mpv-easy/assdraw"
import { OsdOverlay, getAssScale } from "@mpv-easy/tool"
import { lenToNumber, getAttribute } from "@r-tui/flex"
import type { MpDom } from "./dom"
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

export function readAttr<D extends MpDom, R = any>(
  node: D,
  attrName: string,
): R | undefined {
  while (node && typeof getAttribute<D, R>(node, attrName) === "undefined") {
    if (node.parentNode) {
      node = node.parentNode as D
    } else {
      return undefined
    }
  }
  return getAttribute<D, R>(node, attrName)
}

const GetAssTextAssdraw = new AssDraw()
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
  return GetAssTextAssdraw.clear()
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

const MeasureOverlay: OsdOverlay = new OsdOverlay({
  computeBounds: true,
  hidden: true,
})

const _measureCache: Record<string, Shape> = {}
export function measureText(node: MpDom): Shape {
  const assScale = getAssScale()
  const textCache = getAssText(node, 0, 0)
  if (_measureCache[textCache]) {
    return _measureCache[textCache]
  }

  MeasureOverlay.data = textCache
  const { width, height } = MeasureOverlay.update(1 / assScale)
  const { layoutNode } = node
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
