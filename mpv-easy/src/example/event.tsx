import { Box, render } from "@mpv-easy/ui"
import React from "react"

function Counter() {
  return (
    <Box
      width={"50%"}
      height={"50%"}
      backgroundColor="FF0000"
      onMouseDown={() => console.log("1")}
    >
      <Box
        width={"50%"}
        height={"50%"}
        backgroundColor="00FF00"
        onMouseDown={() => console.log("2")}
      >
        <Box
          width={"50%"}
          height={"50%"}
          backgroundColor="0000FF"
          onMouseDown={() => console.log("3")}
        />
      </Box>
    </Box>
  )
}

render(<Counter />)
