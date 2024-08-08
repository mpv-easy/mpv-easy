import { Box, useOsdDimensions } from "@mpv-easy/solid"
import { COLORS } from "e-color"
import { createSignal } from "solid-js"

const row = 10
const col = 10

const colorList = Object.values(COLORS).map((i) =>
  i.toString(16).padStart(6, "0"),
)

export function ColorBox() {
  const [count, setCount] = createSignal(0)

  setInterval(() => {
    setCount((c) => c + 1)
  }, 100)

  const osd = useOsdDimensions()!
  const boxW = () => osd().w / col
  const boxH = () => osd().h / row

  return new Array(row * col).fill(0).map((_, k) => {
    return (
      <Box
        key={k}
        id={k.toString()}
        width={boxW()}
        height={boxH()}
        backgroundColor={colorList[k]}
        text={`${count()}`}
      />
    )
  })
}
