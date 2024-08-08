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

  console.log("============count: ", count())
  return (
    <Box
      id="counter-main"
      fontSize={boxSize / 4}
      display="flex"
      flexDirection="column"
      justifyContent="start"
      alignItems="start"
      color="00FF00"
      backgroundColor="00FFFF"
      text={`${count()}`}
    />
  )
}
