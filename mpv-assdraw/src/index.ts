import { Rgb, COLORS } from "e-color"
import type { ColorName } from "e-color"

const c = 0.551915024494 // 圆形近似值

export class AssDraw {
  private _scale: number
  private _text: string
  constructor(scale = 1, text = "") {
    this._text = text
    this._scale = scale
  }

  newEvent() {
    if (this._text.length > 0) {
      this._text += "\n"
    }
    return this
  }

  font(fontName: string) {
    return this.append(`{\\fn${fontName}}`)
  }
  scale(scale: number) {
    this._scale = scale
    return this
  }
  text(text: string) {
    this._text = text
    return this
  }
  drawStart() {
    this._text = `${this._text}{\\p${this._scale}}`
    return this
  }

  drawStop() {
    this._text = `${this._text}{\\p0}`
    return this
  }

  coord(x: number, y: number) {
    const scale = 2 ** (this._scale - 1)
    const ix = Math.ceil(x * scale)
    const iy = Math.ceil(y * scale)
    this._text = `${this._text} ${ix} ${iy}`
    return this
  }

  append(s: string) {
    this._text += s
    return this
  }

  merge(other: AssDraw) {
    this._text += other.text
    return this
  }

  pos(x: number, y: number) {
    return this.append(`{\\pos(${x},${y})}`)
  }

  an(an: number) {
    return this.append(`{\\an${an}}`)
  }

  moveTo(x: number, y: number) {
    return this.append(" m").coord(x, y)
  }

  lineTo(x: number, y: number) {
    return this.append(" l").coord(x, y)
  }

  bezierCurve(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ) {
    return this.append(" b").coord(x1, y1).coord(x2, y2).coord(x3, y3)
  }

  q(size: number) {
    return this.append(`{\\q${size}}`)
  }

  borderSize(size: number) {
    return this.append(`{\\bord${size}}`)
  }
  fontBorderSize(size: number) {
    return this.append(`{\\bord${size}}`)
  }
  borderColor(color: string) {
    return this.append(`{\\3c&H${color}&}`)
  }

  blur(size: number) {
    return this.append(`{\\blur${size}}`)
  }

  blurX(size: number) {
    return this.append(`{\\blurX${size}}`)
  }

  blurY(size: number) {
    return this.append(`{\\blurY${size}}`)
  }

  fontSize(size: number) {
    return this.append(`{\\fs${size}}`)
  }

  fontBorderAlpha(alpha: string) {
    if (alpha.length !== 2) {
      throw new Error(`alpha error: ${alpha}`)
    }
    return this.append(`{\\3a&H${alpha}}`)
  }
  fontBorderColor(color: string) {
    if (color.length === 6) {
      return this.append(`{\\3c${color}&}`)
    }

    if (color.length === 8) {
      return this.append(`{\\3c&${color.slice(0, 6)}&}`).fontBorderAlpha(
        color.slice(-2),
      )
    }

    throw new Error(`color error: ${color}`)
  }
  newLine() {
    return this.append("\r")
  }

  rectCcw(x0: number, y0: number, x1: number, y1: number) {
    return this.moveTo(x0, y0).lineTo(x0, y1).lineTo(x1, y1).lineTo(x1, y0)
  }

  rectCw(x0: number, y0: number, x1: number, y1: number) {
    return this.moveTo(x0, y0).lineTo(x1, y0).lineTo(x1, y1).lineTo(x0, y1)
  }

  hexagonCw(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r1: number,
    r2: number = r1,
  ) {
    this.moveTo(x0 + r1, y0)
    if (x0 !== x1) {
      this.lineTo(x1 - r2, y0)
    }
    this.lineTo(x1, y0 + r2)
    if (x0 !== x1) {
      this.lineTo(x1 - r2, y1)
    }
    this.lineTo(x0 + r1, y1)
    this.lineTo(x0, y0 + r1)
    return this
  }

  hexagonCcw(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r1: number,
    r2: number = r1,
  ) {
    this.moveTo(x0 + r1, y0)
    this.lineTo(x0, y0 + r1)
    this.lineTo(x0 + r1, y1)
    if (x0 !== x1) {
      this.lineTo(x1 - r2, y1)
    }
    this.lineTo(x1, y0 + r2)
    if (x0 !== x1) {
      this.lineTo(x1 - r2, y0)
    }

    return this
  }

  roundRectCw(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r1: number,
    r2: number = r1,
  ) {
    const c1 = c * r1 // circle approximation
    const c2 = c * r2 // circle approximation
    this.moveTo(x0 + r1, y0)
    this.lineTo(x1 - r2, y0) // top line
    if (r2 > 0) {
      this.bezierCurve(x1 - r2 + c2, y0, x1, y0 + r2 - c2, x1, y0 + r2) // top right corner
    }
    this.lineTo(x1, y1 - r2) // right line
    if (r2 > 0) {
      this.bezierCurve(x1, y1 - r2 + c2, x1 - r2 + c2, y1, x1 - r2, y1) // bottom right corner
    }
    this.lineTo(x0 + r1, y1) // bottom line
    if (r1 > 0) {
      this.bezierCurve(x0 + r1 - c1, y1, x0, y1 - r1 + c1, x0, y1 - r1) // bottom left corner
    }
    this.lineTo(x0, y0 + r1) // left line
    if (r1 > 0) {
      this.bezierCurve(x0, y0 + r1 - c1, x0 + r1 - c1, y0, x0 + r1, y0) // top left corner
    }
    return this
  }

  roundRectCcw(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r1: number,
    r2: number = r1,
  ) {
    const c1 = c * r1 // circle approximation
    const c2 = c * r2 // circle approximation
    this.moveTo(x0 + r1, y0)
    if (r1 > 0) {
      this.bezierCurve(x0 + r1 - c1, y0, x0, y0 + r1 - c1, x0, y0 + r1) // top left corner
    }
    this.lineTo(x0, y1 - r1) // left line
    if (r1 > 0) {
      this.bezierCurve(x0, y1 - r1 + c1, x0 + r1 - c1, y1, x0 + r1, y1) // bottom left corner
    }
    this.lineTo(x1 - r2, y1) // bottom line
    if (r2 > 0) {
      this.bezierCurve(x1 - r2 + c2, y1, x1, y1 - r2 + c2, x1, y1 - r2) // bottom right corner
    }
    this.lineTo(x1, y0 + r2) // right line
    if (r2 > 0) {
      this.bezierCurve(x1, y0 + r2 - c2, x1 - r2 + c2, y0, x1 - r2, y0) // top right corner
    }
    return this
  }

  drawTriangle(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    return this.moveTo(x0, y0).lineTo(x1, y1).lineTo(x2, y2).lineTo(x0, y0)
  }
  drawRrhCw(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r1: number,
    hexagon?: boolean,
    r2?: number,
  ) {
    return hexagon
      ? this.hexagonCw(x0, y0, x1, y1, r1, r2)
      : this.roundRectCw(x0, y0, x1, y1, r1, r2)
  }
  drawRrHCcw(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r1: number,
    hexagon?: boolean,
    r2?: number,
  ) {
    return hexagon
      ? this.hexagonCcw(x0, y0, x1, y1, r1, r2)
      : this.roundRectCcw(x0, y0, x1, y1, r1, r2)
  }

  end() {
    return this.append(" s")
  }

  color(color: string | number) {
    if (typeof color === "number") {
      color = color.toString(16).padStart(6, "0")
    }
    if (color.length === 8) {
      return this.append(`{\\c&${color.slice(0, 6)}&}`).alpha(color.slice(-2))
    }
    if (color.length === 6) {
      return this.append(`{\\c&${color}&}`)
    }
    throw new Error(`AssDraw color error: ${color}`)
  }

  colorText(color: string, text: string) {
    return this.color(color).append(text)
  }

  // 00-FF or 0-255
  alpha(hex: string | number) {
    if (typeof hex === "number") {
      hex = hex.toString(16).padStart(2, "0")
    }
    return this.append(`{\\alpha&H${hex.padStart(2, "0")}}`)
  }

  toString() {
    return this._text
  }
}

type ExtType = {
  [X in ColorName as Uncapitalize<X>]: () => AssDraw
} & {
  [X in ColorName as `${Uncapitalize<X>}Text`]: (text: string) => AssDraw
}

export interface AssDraw extends ExtType {}

for (const i in COLORS) {
  const name = i.charAt(0).toLowerCase() + i.slice(1)

  const rgb = new Rgb(COLORS[i as ColorName])

  // TODO: maybe transform to es5 cause this problem, prototype break
  // @ts-ignore
  if (typeof rgb.color === "undefined") {
    // @ts-ignore
    rgb.color = COLORS[i]
  }

  // const hex = Bgr.fromName(i as ColorName).toHex()
  const hex = rgb.toHex()

  // @ts-ignore
  AssDraw.prototype[name] = function () {
    // @ts-ignore
    return this.color(hex)
  }

  // @ts-ignore
  AssDraw.prototype[`${name}Text`] = function (text: string) {
    // @ts-ignore
    return this.colorText(hex, text)
  }
}

export function drawRect({
  x,
  y,
  borderSize = 0,
  color = "00000000",
  width,
  height,
  borderColor = "00000000",
  borderRadius = 0,
}: {
  x: number
  y: number
  color?: string
  width: number
  height: number
  borderSize?: number
  borderColor?: string
  borderRadius?: number
}) {
  return new AssDraw()
    .color(color)
    .drawStart()
    .pos(x, y)
    .borderSize(borderSize)
    .borderColor(borderColor)
    .roundRectCw(0, 0, width, height, borderRadius)
    .end()
    .toString()
}

export function drawBorder({
  x,
  y,
  width,
  height,
  borderSize,
  borderColor,
}: {
  x: number
  y: number
  width: number
  height: number
  borderSize: number
  borderColor: string
}): string {
  return (
    new AssDraw()
      .color(borderColor)
      .drawStart()
      .borderSize(0)
      .pos(x, y)

      // top
      // .moveTo(0, 0)
      // .lineTo(width, 0)
      // .lineTo(width, borderSize)
      // .lineTo(0, borderSize)
      // .lineTo(0, 0)
      .rectCw(0, 0, width, borderSize)

      // left
      // .moveTo(0, 0)
      // .lineTo(borderSize, 0)
      // .lineTo(borderSize, height)
      // .lineTo(0, height)
      // .lineTo(0, 0)
      .rectCw(0, 0, borderSize, height)

      // bottom
      // .moveTo(0, height - borderSize)
      // .lineTo(width, height - borderSize)
      // .lineTo(width, height)
      // .lineTo(0, height)
      // .lineTo(0, height - borderSize)
      .rectCw(0, height - borderSize, width, height)

      // right
      // .moveTo(width - borderSize, 0)
      // .lineTo(width, 0)
      // .lineTo(width, height)
      // .lineTo(width - borderSize, height)
      // .lineTo(width - borderSize, 0)
      .rectCw(width - borderSize, 0, width, height)

      .toString()
  )
}

export function drawCircle({
  x,
  y,
  color,
  radius,
}: {
  x: number
  y: number
  color: string
  radius: number
  alpha: number | string
}) {
  return new AssDraw()
    .color(color)
    .drawStart()
    .pos(x, y)
    .roundRectCw(0, 0, radius, radius, radius / 2, radius / 2)
    .toString()
}
