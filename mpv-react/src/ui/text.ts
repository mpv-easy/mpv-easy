import { getPropertyNumber, createOsdOverlay, Rect } from "@mpv-easy/tool"

export function scaleText(text: string, maxWidth: number, maxHeight: number) {
  const fontSize = getPropertyNumber("options/osd-font-size")!
  const ovl = createOsdOverlay()
  ovl.hidden = true
  ovl.compute_bounds = true
  ovl.data = text
  const coord = ovl.update()
  const rect = Rect.fromCoord(coord as any)
  const sw = maxWidth / rect.width
  const sh = maxHeight / rect.height
  const s = Math.min(sw, sh)
  return {
    fontSize: fontSize * s,
    scale: s,
    width: rect.width * s,
    height: rect.height * s,
    x: rect.x,
    y: rect.y,
  }
}
