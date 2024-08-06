import { Box, render } from "@mpv-easy/solid"
import { createSignal } from "solid-js"

export default function App() {
  const [count, setCount] = createSignal(0)
  setInterval(() => {
    setCount((c) => ++c)
  }, 1000)

  return (
    <Box
      width={"100%"}
      height={"100%"}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box color="red" text={"count"} />
      <Box color="green" text={":"} />
      <Box color="blue" text={`${count()}`} />
    </Box>
  )
}
