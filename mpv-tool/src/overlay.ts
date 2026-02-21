import { overlayAdd, overlayRemove } from "./type-cmd"

const maxId = 64
const overlayIdUsed = new Array(maxId).map(() => false)

/**
 * Get an available overlay ID.
 * https://mpv.io/manual/stable/#command-interface-overlay-add
 * @param preferredId The ID you'd like to use.
 * @returns An available ID between 0 and 63.
 * @throws Error if no ID is available.
 */
function getOverlayId(preferredId: number): number {
  if (preferredId < 0 || preferredId >= maxId) {
    throw new Error(`overlay's id(${preferredId}) must be in the range [0, 63]`)
  }

  if (preferredId >= 0 && preferredId < maxId && !overlayIdUsed[preferredId]) {
    overlayIdUsed[preferredId] = true
    return preferredId
  }

  for (let i = 0; i < maxId; i++) {
    if (!overlayIdUsed[i]) {
      overlayIdUsed[i] = true
      return i
    }
  }

  throw new Error("No available overlay ID (0-63)")
}

export class Overlay {
  public x = 0
  public y = 0
  public file = ""
  public offset = 0
  public fmt = "bgra"
  public w = 0
  public h = 0
  public stride = 0
  public dw: number | undefined = undefined
  public dh: number | undefined = undefined
  public id: number

  constructor(id: number) {
    const finalId = getOverlayId(id)
    if (finalId !== id) {
      print(
        `[overlay] ID ${id} is already in use, assigned ${finalId} instead.`,
      )
    }
    this.id = finalId
  }

  update() {
    overlayAdd(
      this.id,
      this.x,
      this.y,
      this.file,
      0,
      this.fmt,
      this.w,
      this.h,
      this.stride,
      this.dw != null ? this.dw : this.w,
      this.dh != null ? this.dh : this.h,
    )
  }

  remove() {
    overlayRemove(this.id)
  }

  destroy() {
    overlayIdUsed[this.id] = false
  }
}
