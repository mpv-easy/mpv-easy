import React, { useState } from "react"
import { Box } from "@mpv-easy/react"

const Minus = "-"
const Plus = "+"
export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Box
        text={Minus}
        color="FF0000"
        width={100}
        height={100}
        fontSize={64}
        backgroundColor={"233233A0"}
        display="flex"
        justifyContent="center"
        alignItems="center"
        onMouseDown={() => {
          console.log("count: ", count)
          setCount((c) => c - 1)
        }}
      />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width={100}
        height={100}
        backgroundColor={count % 2 ? "000000A0" : "00FFFFA0"}
        color="00FF00"
        fontSize={64}
        text={count.toString()}
      />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        text={Plus}
        font="JetBrainsMono NFM Regular"
        color="0000FF"
        width={100}
        height={100}
        fontSize={64}
        backgroundColor={"233233A0"}
        onMouseDown={() => {
          console.log("count: ", count)
          setCount((c) => c + 1)
        }}
      />
    </>
  )
}
