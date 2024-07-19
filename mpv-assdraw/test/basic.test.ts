import { expect, test } from "vitest"
import { AssDraw } from "../src"
import { Bgr, COLORS, Rgb } from "e-color"

test("base test", () => {
  const s = new AssDraw().blueText("hello ").redText("world").toString()
  expect(s).toEqual("{\\c&0000FF&}hello {\\c&FF0000&}world")
})

test("fromName", () => {
  const c1 = Bgr.fromName("AliceBlue").toHex()
  expect(c1).toEqual("FFF8F0")

  const c2 = new Rgb(COLORS.AliceBlue).toBgr().toHex()
  expect(c2).toEqual("FFF8F0")
})
