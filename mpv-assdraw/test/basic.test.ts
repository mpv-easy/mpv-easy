import { expect, test } from "vitest"
import { AssDraw } from "../src"

test("base test", () => {
  const s = new AssDraw().blueText("hello ").redText("world").toString()
  expect(s).toEqual("{\\c&FF0000&}hello {\\c&0000FF&}world")
})
