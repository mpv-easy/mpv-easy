export enum ColorFormat {
  Rgba = 0,
  Bgra = 1,
}

export class Color {
  private color = 0
  private format = ColorFormat.Rgba

  private constructor(color: number | number = 0, format = ColorFormat.Rgba) {
    this.color = typeof color === "number" ? color : parseInt(color, 16)
    this.format = format
  }
  static fromRgba(rgba: string | number) {
    const c = typeof rgba === "number" ? rgba : parseInt(rgba, 16)
    return new Color(c, ColorFormat.Rgba)
  }

  static fromBgra(bgra: string | number) {
    const c = typeof bgra === "number" ? bgra : parseInt(bgra, 16)
    return new Color(c, ColorFormat.Bgra)
  }

  toRgba() {
    if (this.format === ColorFormat.Rgba) {
      return this
    }
    this.color = bgraToRgba(this.color)
    this.format = ColorFormat.Rgba
    return this
  }

  toBgra() {
    if (this.format === ColorFormat.Bgra) {
      return this
    }
    this.color = rgbaToBgra(this.color)
    this.format = ColorFormat.Bgra
    return this
  }

  invert() {
    this.color =
      this.format === ColorFormat.Bgra
        ? invertBGRAColor(this.color)
        : invertRGBAColor(this.color)
    return this
  }

  toHex(prefix = "") {
    const hex = this.color.toString(16).padStart(8, "0")
    return prefix + hex
  }
  static Red = new Color(0xff0000ff, ColorFormat.Rgba)
  static White = new Color(0xffffffff, ColorFormat.Rgba)
  static Black = new Color(0x00000ff, ColorFormat.Rgba)
  static Blue = new Color(0x0000ffff, ColorFormat.Rgba)
  static Green = new Color(0x00ff00ff, ColorFormat.Rgba)
  static Yellow = new Color(0xffff00ff, ColorFormat.Rgba)
  static Cyan = new Color(0x00ffffff, ColorFormat.Rgba)
  static Magenta = new Color(0xff00ffff, ColorFormat.Rgba)
}

// RGBA to BGRA conversion
export function rgbaToBgra(rgba: number): number {
  const alpha = (rgba >> 24) & 0xff
  const red = (rgba >> 16) & 0xff
  const green = (rgba >> 8) & 0xff
  const blue = rgba & 0xff

  return (alpha << 24) | (blue << 16) | (green << 8) | red
}

// BGRA to RGBA conversion
export function bgraToRgba(bgra: number): number {
  const alpha = (bgra >> 24) & 0xff
  const blue = (bgra >> 16) & 0xff
  const green = (bgra >> 8) & 0xff
  const red = bgra & 0xff

  return (alpha << 24) | (red << 16) | (green << 8) | blue
}

export function invertRGBAColor(rgba: number): number {
  const alpha = (rgba >> 24) & 0xff
  const red = (rgba >> 16) & 0xff
  const green = (rgba >> 8) & 0xff
  const blue = rgba & 0xff

  return (
    (alpha << 24) | ((255 - red) << 16) | ((255 - green) << 8) | (255 - blue)
  )
}
export function invertBGRAColor(bgra: number): number {
  const alpha = (bgra >> 24) & 0xff
  const blue = (bgra >> 16) & 0xff
  const green = (bgra >> 8) & 0xff
  const red = bgra & 0xff

  return (
    (alpha << 24) | ((255 - blue) << 16) | ((255 - green) << 8) | (255 - red)
  )
}
