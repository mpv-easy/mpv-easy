import "@mpv-easy/polyfill"
import { usePropertyBool } from "@mpv-easy/react"
import { Box, render } from "@mpv-easy/react"
import React from "react"

const pauseIcon = "▶"
const playIcon = "⏸"
function Play() {
  const [pause, setPause] = usePropertyBool("pause", false)
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width={"100%"}
      height={"100%"}
      fontSize={100}
    >
      <Box
        text={pause ? pauseIcon : playIcon}
        onClick={() => setPause((c) => !c)}
      />
    </Box>
  )
}

render(<Play />)
