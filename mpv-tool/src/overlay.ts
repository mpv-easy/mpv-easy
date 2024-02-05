//   data: string
// res_x: number
// res_y: number
// z: number
// hidden: boolean
// compute_bounds: boolean
// update(): { } | { x0: number; y0: number; x1: number; y1: number }
// remove(): void

import { command, commandNativeAsync } from "./mpv"

// ``overlay-add <id> <x> <y> <file> <offset> <fmt> <w> <h> <stride>``

const maxId = 64
const overlayIdUsed = Array(maxId).fill(false)

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
    if (overlayIdUsed[id] !== false || id < 0 || id >= maxId) {
      throw new Error("overlay id error: " + id)
    }
    overlayIdUsed[id] = true
  }

  update() {
    const cmd = `overlay-add ${this.id} ${this.x} ${this.y} ${this.file} 0 ${this.fmt} ${this.w} ${this.h} ${this.stride}`
    command(cmd)
  }

  remove() {
    commandNativeAsync({
      name: "overlay-remove",
      id: this.id,
    })
  }
}
