import React from "react"
import { CounterProvider } from "./"

import { useCounter } from "./"
import { Box, render } from "@mpv-easy/ui"

const CounterComponent: React.FC = () => {
  const { state, dispatch } = useCounter()

  return (
    <Box fontSize={64}>
      <Box text={state.count.toString()}></Box>
      <Box text="-" onMouseDown={() => dispatch({ type: "DECREMENT" })} />
      <Box text="+" onMouseDown={() => dispatch({ type: "INCREMENT" })} />
    </Box>
  )
}

render(
  <CounterProvider>
    <CounterComponent />
  </CounterProvider>,
)
