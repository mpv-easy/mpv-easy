import { usePropertyBool } from "@mpv-easy/hook"
import "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/react"
import React from "react"

const pauseIcon = ""
const playIcon = ""
function Play() {
  const [pause, setPause] = usePropertyBool("pause", false)
  return (
    <Box
      x={0}
      y={0}
      text={pause ? pauseIcon : playIcon}
      onClick={() => setPause((c) => !c)}
    />
  )
}

render(<Play />)
