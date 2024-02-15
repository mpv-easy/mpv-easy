import { createStore, getConfig, Easy } from "@mpv-easy/mpv-easy"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"
import { Provider } from "react-redux"
function Counter() {
  const [x, setX] = useState(100)

  useEffect(() => {
    setInterval(() => {
      setX(x => x + 10)
    }, 1000)
  }, [])

  return <Box
    id='qjs-box'
    position='absolute'
    x={x}
    y={200}
    width={100}
    height={200}
    backgroundColor='00FF00'
    zIndex={100}
  />
}
export const renderCounter = () => {
  render(
    <Counter />
  )
}