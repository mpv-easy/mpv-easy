import {
  getPropertyNumber,
  createOsdOverlay,
  Rect,
  type MpvOsdOverlay,
} from "@mpv-easy/tool"

let ScaleOvl: MpvOsdOverlay
export function scaleText(text: string, maxWidth: number, maxHeight: number) {
  const fontSize = getPropertyNumber("options/osd-font-size")!
  if (!ScaleOvl) {
    ScaleOvl = createOsdOverlay()
  }
  ScaleOvl.hidden = true
  ScaleOvl.compute_bounds = true
  ScaleOvl.data = text
  const coord = ScaleOvl.update()
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
