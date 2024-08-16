import React, { useEffect } from "react"
import { Box } from "@mpv-easy/react"
import { useState } from "react"

const boxSize = 200

export function CounterDouble() {
  const [count, setCount] = useState(0)
  const double = count * 2
  useEffect(() => {
    setInterval(() => {
      setCount((c) => c + 1)
    }, 1000)
  }, [])

  return (
    <>
      <Box
        id="counter"
        fontSize={boxSize / 4}
        display="flex"
        flexDirection="column"
        justifyContent="start"
        alignItems="start"
        color="#00FF00"
        backgroundColor="#00FFFF"
        text={`${count}`}
      />
      <Box
        id="counter-double"
        fontSize={boxSize / 4}
        display="flex"
        flexDirection="column"
        justifyContent="start"
        alignItems="start"
        color="#00FF00"
        backgroundColor="#00FFFF"
        text={`${double}`}
      />
    </>
  )
}
