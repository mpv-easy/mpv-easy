import { Rect, type CoordRect } from "./common"
import { createOsdOverlay } from "./mpv"
import type { MpvOsdOverlay } from "./type"

const overlayPool: {
  overlay: MpvOsdOverlay
  busy: boolean
}[] = []
function getOverlay(): MpvOsdOverlay {
  for (let i = 0; i < overlayPool.length; i++) {
    const item = overlayPool[i]
    if (item && !item.busy) {
      item.busy = true
      return item.overlay
    }
  }

  const overlay = createOsdOverlay()
  overlay.remove = () => {
    overlay.hidden = true
    overlay.data = ""
    overlay.compute_bounds = false
    overlay.update()
    overlayPool[overlay.id || 0].busy = false
  }
  overlayPool[overlay.id || 0] = { overlay, busy: true }
  return overlay
}

export type OverlayConfig = {
  hidden: boolean
  computeBounds: boolean
  resX: number
  resY: number
  z: number
  data: string
  overlay: MpvOsdOverlay
  cache: boolean
}

export class OsdOverlay {
  private overlay: MpvOsdOverlay
  private cache: boolean
  constructor(option: Partial<OverlayConfig> = {}) {
    const {
      hidden = false,
      resX = 0,
      resY = 720,
      z = 0,
      computeBounds = true,
      data = "",
      cache = false,
      overlay = getOverlay(),
    } = option

    overlay.res_x = resX
    overlay.res_y = resY
    overlay.hidden = hidden
    overlay.compute_bounds = computeBounds
    overlay.data = data
    overlay.z = z
    this.cache = cache
    this.overlay = overlay
  }

  set hidden(hidden: boolean) {
    this.overlay.hidden = hidden
  }
  get hidden() {
    return this.overlay.hidden
  }

  set computeBounds(computeBounds: boolean) {
    this.overlay.compute_bounds = computeBounds
  }
  get computeBounds() {
    return this.overlay.compute_bounds
  }
  set z(z: number) {
    this.overlay.z = z
  }
  get z() {
    return this.overlay.z
  }
  set data(data: string) {
    this.overlay.data = data
  }
  get data() {
    return this.overlay.data
  }
  set resX(resX: number) {
    this.overlay.res_x = resX
  }
  get resX() {
    return this.overlay.res_x
  }
  set resY(resY: number) {
    this.overlay.res_y = resY
  }
  get resY() {
    return this.overlay.res_y
  }

  remove() {
    this.overlay.remove()
  }

  private _lastResY: number | undefined = undefined
  private _lastResX: number | undefined = undefined
  private _lastHidden: boolean | undefined = undefined
  private _lastComputeBounds: boolean | undefined = undefined
  private _lastData: string | undefined = undefined
  private _lastZ: number | undefined = undefined
  private _lastRect: Rect | undefined = undefined
  update(scale = 1): Rect {
    if (this.cache) {
      if (
        this._lastResX === this.resX &&
        this._lastResY === this.resY &&
        this._lastHidden === this.hidden &&
        this._lastComputeBounds === this.computeBounds &&
        this._lastData === this.data &&
        this._lastZ === this.z
      ) {
        return this._lastRect!
      }
      this._lastResY = this.resY
      this._lastResX = this.resX
      this._lastHidden = this.hidden
      this._lastComputeBounds = this.computeBounds
      this._lastData = this.data
      this._lastZ = this.z
      const coord = this.overlay.update() as CoordRect
      this._lastRect = Rect.fromCoord(coord).scale(scale)
      return this._lastRect
    }

    const coord = this.overlay.update() as CoordRect
    return Rect.fromCoord(coord).scale(scale)
  }
}
