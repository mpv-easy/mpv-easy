import { AssDraw } from "@mpv-easy/assdraw"
import { OsdOverlay, getAssScale } from "@mpv-easy/tool"
import { lenToNumber, getFirstValidAttribute } from "@r-tui/flex"
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

const GetAssTextAssdraw = new AssDraw()
export function getAssText(node: MpDom, x: number, y: number) {
  const { text = "" } = node.attributes
  const assScale = getAssScale()
  const font = getFirstValidAttribute(node, 'font') ?? ""
  let color = getFirstValidAttribute(node, "color") ?? "FFFFFFFF"
  const fontSize = getFirstValidAttribute(node, "fontSize") ?? "5%"
  const fontBorderSize = getFirstValidAttribute(node, "fontBorderSize") ?? 0
  const fontBorderColor =
    getFirstValidAttribute(node, "fontBorderColor") ?? "000000"
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
