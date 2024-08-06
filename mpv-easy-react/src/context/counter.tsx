import React from "react"
import { StoreProvider } from "./"

import { useStore } from "./"
import { Box, render } from "@mpv-easy/react"

const CounterComponent: React.FC = () => {
  const { state, dispatch } = useStore()

  return (
    <Box fontSize={64}>
      <Box text={state.count.toString()} />
      <Box text="-" onMouseDown={() => dispatch({ type: "DECREMENT" })} />
      <Box text="+" onMouseDown={() => dispatch({ type: "INCREMENT" })} />
    </Box>
  )
}

render(
  <StoreProvider>
    <CounterComponent />
  </StoreProvider>,
)
