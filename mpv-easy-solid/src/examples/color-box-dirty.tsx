import { Box, useOsdDimensions } from "@mpv-easy/solid"
import { COLORS } from "e-color"
import { createSignal } from "solid-js"

const row = 10
const col = 10

const colorList = Object.values(COLORS).map((i) =>
  i.toString(16).padStart(6, "0"),
)

export function ColorBoxDirty() {
  const [count, setCount] = createSignal(0)

  setInterval(() => {
    setCount((c) => c + 1)
  }, 100)

  const osd = useOsdDimensions()!
  const boxW = () => osd().w / col
  const boxH = () => osd().h / row

  return <Box
    position='relative'
    display="flex"
    width={'100%'}
    height={'100%'}
    alignContent='stretch'
  >{new Array(row * col).fill(0).map((_, k) => {
    return (
      <Box
        key={k}
        id={k.toString()}
        width={boxW()}
        height={boxH()}
        backgroundColor={colorList[k]}
        text={`${k}`}
      />
    )
  })}<Box
      position="absolute"
      display="flex"
      id={"count"}
      width={boxW()}
      height={boxH()}
      backgroundColor={colorList[0]}
      text={`${count()}`}
    />
  </Box>
}
