export type CoordRect = {
  x0: number
  y0: number
  x1: number
  y1: number
}

export class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  get x0() {
    return this.x
  }
  get y0() {
    return this.y
  }
  get x1() {
    return this.x + this.width
  }
  get y1() {
    return this.y + this.height
  }

  toCoord() {
    return {
      x0: this.x0,
      y0: this.y0,
      x1: this.x1,
      y1: this.y1,
    }
  }

  static fromCoord(coord: CoordRect) {
    return new Rect(
      coord.x0,
      coord.y0,
      coord.x1 - coord.x0,
      coord.y1 - coord.y0,
    )
  }

  hasPoint(x: number, y: number) {
    if (x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1) {
      return true
    }
    return false
  }

  placeCenter(other: Rect) {
    const dx = (this.width - other.width) / 2
    const dy = (this.height - other.height) / 2
    const nx = this.x + dx
    const ny = this.y + dy
    return new Rect(nx, ny, other.width, other.height)
  }

  scale(scale: number): Rect {
    return new Rect(
      this.x * scale,
      this.y * scale,
      this.width * scale,
      this.height * scale,
    )
  }
}

export type Cycle = {
  x: number
  y: number
  radius: number
}

export function assSizeToScreen() {}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

export function sleep(ms = 1000) {
  return new Promise((r) => setTimeout(r, ms))
}

export function choice<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined
  }
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}
