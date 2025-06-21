import { AssDraw } from "@mpv-easy/assdraw"
import { OsdOverlay, getAssScale } from "@mpv-easy/tool"
import {
  lenToNumber,
  getFirstValidAttribute,
  type Shape,
  WordBreak,
} from "@mpv-easy/flex"
import type { MpDom } from "./dom"
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

function maxWidth(
  text: string,
  maxLength = 0,
  wordBreak: WordBreak = "break-all",
): string {
  if (!maxLength || text.length <= maxLength) {
    return text
  }
  switch (wordBreak) {
    case "break-word": {
      const lines: string[] = []
      let currentLine: string[] = []
      for (const word of text.split(" ")) {
        if (word === "\n") {
          lines.push(currentLine.join(" "))
          currentLine = []
        } else {
          if (
            currentLine.length === 0 ||
            currentLine.join(" ").length + word.length <= maxLength
          ) {
            currentLine.push(word)
          } else {
            lines.push(currentLine.join(" "))
            currentLine = [word]
          }

          if (currentLine.join(" ").length >= maxLength) {
            lines.push(currentLine.join(" "))
            currentLine = []
          }
        }
      }
      if (currentLine.length) {
        lines.push(currentLine.join(" "))
        currentLine = []
      }
      return lines.join("\n")
    }
    default: {
      const lines: string[] = []
      let currentLine: string[] = []

      for (const word of text.split("")) {
        if (word === "\n") {
          lines.push(currentLine.join(""))
          currentLine = []
        } else {
          currentLine.push(word)
          if (currentLine.length === maxLength) {
            lines.push(currentLine.join(""))
            currentLine = []
          }
        }
      }

      if (currentLine.length) {
        lines.push(currentLine.join(""))
        currentLine = []
      }

      return lines.join("\n")
    }
  }
}

export function getAssText(node: MpDom, x: number, y: number) {
  const { text = "" } = node.attributes
  const t = maxWidth(
    text.replaceAll("\r\n", "\n"),
    node.attributes.maxWidth,
    node.attributes.wordBreak,
  )
    .replaceAll("\n", "\\N")
    .replaceAll("\t", "    ")
  const assScale = getAssScale()
  const font = getFirstValidAttribute(node, "font") ?? ""
  let color = getFirstValidAttribute(node, "color") ?? "#FFFFFFFF"
  const fontSize = getFirstValidAttribute(node, "fontSize") ?? "5%"
  const bold = getFirstValidAttribute(node, "fontWeight") === "bold"
  const fontBorderSize = getFirstValidAttribute(node, "fontBorderSize") ?? 0
  const fontBorderColor =
    getFirstValidAttribute(node, "fontBorderColor") ?? "#000000"
  let alpha = "FF"
  if (color.length === 7 || color.length === 6) {
    alpha = "00"
  }
  if (color.length === 8 || color.length === 9) {
    alpha = color.slice(-2)
    color = color.slice(0, -2)
  }
  if (alpha === "FF") {
    return ""
  }
  const s = GetAssTextAssdraw.clear()
    .pos(x, y)
    .font(font)
    .fontSize(lenToNumber(node, fontSize, false, 32) * assScale)
    .fontBorderColor(fontBorderColor)
    .fontBorderSize(lenToNumber(node, fontBorderSize, false, 0) * assScale)
    .color(color)
    .alpha(alpha)
    .bold(bold)
    .append(t)
    .toString()
  return s
}

let MeasureOverlay: OsdOverlay

// const _measureCache: Record<string, Shape> = {}
export function measureText(node: MpDom): Shape {
  const assScale = getAssScale()
  const textCache = getAssText(node, 0, 0)
  // if (_measureCache[textCache]) {
  //   return _measureCache[textCache]
  // }

  // TODO: playground  polyfill
  if (!MeasureOverlay) {
    MeasureOverlay = new OsdOverlay({
      computeBounds: true,
      hidden: true,
    })
  }

  MeasureOverlay.data = textCache
  const { width, height } = MeasureOverlay.update(1 / assScale)
  const { layoutNode } = node
  layoutNode.textRect.width = width
  layoutNode.textRect.height = height
  const rect = { width, height }
  // _measureCache[textCache] = rect
  return rect
}
