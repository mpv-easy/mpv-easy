import { AssDraw } from "@mpv-easy/assdraw"
import { getAssScale, Rect } from "./common"
import { getOsdSize } from "./mpv"
import { OsdOverlay } from "./osd-overlay"

let ovl: OsdOverlay
let ovlHandle = 0

export function hideNotification() {
  ovl.data = ""
  ovl.hidden = true
  ovl.update()
  ovl.remove()
  clearTimeout(ovlHandle)
  ovlHandle = 0
}

export function showNotification(text: string, seconds = 1) {
  if (!ovl) {
    ovl = new OsdOverlay()
  }
  if (ovlHandle) {
    clearTimeout(ovlHandle)
    ovlHandle = 0
  }
  ovl.data = text
  ovl.computeBounds = true
  ovl.hidden = true
  const scale = getAssScale()
  const rect = ovl.update(1 / scale)
  const osd = getOsdSize()
  const osdRect = new Rect(0, 0, osd?.width || 0, osd?.height || 0)
  const centerRect = osdRect.placeCenter(rect)
  ovl.data = new AssDraw()
    .pos(centerRect.x * scale, centerRect.y * scale)
    .append(text)
    .toString()
  ovl.hidden = false
  ovl.update()
  if (seconds > 0) {
    ovlHandle = +setTimeout(() => hideNotification(), seconds * 1000)
  }
  print(text)
}
