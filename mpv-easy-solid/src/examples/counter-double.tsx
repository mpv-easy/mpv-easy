import { Box } from "@mpv-easy/solid"
import { createSignal } from "solid-js"

const White = "FFFFFF"
const Gray = "cccccc"
const Black = "000000"
const Yellow = "00FFFF"

const boxSize = 200
const padding = 10

export function CounterUI() {
  const [count, setCount] = createSignal(0)

  setInterval(() => {
    setCount((c) => c + 1)
  }, 1000)

  const double = () => count() * 2
  return (
    <>
      <Box
        id="counter"
        fontSize={boxSize / 4}
        display="flex"
        flexDirection="column"
        justifyContent="start"
        alignItems="start"
        color="00FF00"
        backgroundColor="00FFFF"
        text={`${count()}`}
      />
      <Box
        id="counter-double"
        fontSize={boxSize / 4}
        display="flex"
        flexDirection="column"
        justifyContent="start"
        alignItems="start"
        color="00FF00"
        backgroundColor="00FFFF"
        text={`${double()}`}
      />
    </>
  )
}
