import { command } from "./mpv"

const maxId = 64
const overlayIdUsed = new Array(maxId).map(() => false)

export class Overlay {
  public x = 0
  public y = 0
  public file = ""
  public offset = 0
  public fmt = "bgra"
  public w = 0
  public h = 0
  public stride = 0

  constructor(public id: number) {
    if (overlayIdUsed[id]) {
      throw new Error(`overlay's id has already been used.${id}`)
    }
    if (id < 0 || id >= maxId) {
      throw new Error(`overlay's id must be in the range [0, 63]${id}`)
    }
    overlayIdUsed[id] = true
  }

  update() {
    const cmd = `overlay-add ${this.id} ${this.x} ${this.y} ${this.file} 0 ${this.fmt} ${this.w} ${this.h} ${this.stride}`
    command(cmd)
  }

  remove() {
    command(`overlay-remove ${this.id}`)
  }

  destroy() {
    overlayIdUsed[this.id] = false
  }
}
