import { expect, test } from "vitest"
import { AssDraw } from "../src"

test("base test", () => {
  const s = new AssDraw().blueText("hello ").redText("world").toString()
  expect(s).toEqual("{\\c&0000FF&}hello {\\c&FF0000&}world")
})
