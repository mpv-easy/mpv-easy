import { Rect, type CoordRect } from "./common"
import { createOsdOverlay, writeFile } from "./mpv"
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
    overlayPool[overlay.id - 1].busy = false
  }
  // MPV overlay id starts from 1
  overlayPool[overlay.id - 1] = { overlay, busy: true }
  return overlay
}

export type OverlayConfig = {
  hidden: boolean
  computeBounds: boolean
  resX: number
  resY: number
  z: number
  data: string
  overlay?: MpvOsdOverlay
  cache: boolean
}

const DefaultOsdOverlayOption = {
  hidden: false,
  resX: 0,
  resY: 720,
  z: 0,
  computeBounds: true,
  data: "",
  cache: false,
}

export class OsdOverlay {
  private overlay: MpvOsdOverlay | undefined
  private option: OverlayConfig
  constructor(option: Partial<OverlayConfig> = {}) {
    this.option = { ...DefaultOsdOverlayOption, ...option }
  }

  set hidden(hidden: boolean) {
    this.option.hidden = hidden
  }
  get hidden() {
    return this.option.hidden
  }

  set computeBounds(computeBounds: boolean) {
    this.option.computeBounds = computeBounds
  }
  get computeBounds() {
    return this.option.computeBounds
  }
  set z(z: number) {
    this.option.z = z
  }
  get z() {
    return this.option.z
  }
  set data(data: string) {
    this.option.data = data
  }
  get data() {
    return this.option.data
  }
  set resX(resX: number) {
    this.option.resX = resX
  }
  get resX() {
    return this.option.resX
  }
  set resY(resY: number) {
    this.option.resY = resY
  }
  get resY() {
    return this.option.resY
  }

  remove() {
    if (this.overlay) {
      this.overlay.remove()
    }
  }

  private _lastResY: number | undefined = undefined
  private _lastResX: number | undefined = undefined
  private _lastHidden: boolean | undefined = undefined
  private _lastComputeBounds: boolean | undefined = undefined
  private _lastData: string | undefined = undefined
  private _lastZ: number | undefined = undefined
  private _lastRect: Rect | undefined = undefined
  update(scale = 1): Rect {
    if (!!this.option.data && !this.overlay) {
      this.overlay = getOverlay()
    }
    if (!this.overlay) {
      return this._lastRect || new Rect(0, 0, 0, 0)
    }

    this.overlay.data = this.option.data
    this.overlay.res_x = this.option.resX
    this.overlay.res_y = this.option.resY
    this.overlay.z = this.option.z
    this.overlay.hidden = this.option.hidden
    this.overlay.compute_bounds = this.option.computeBounds

    if (this.option.cache) {
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
