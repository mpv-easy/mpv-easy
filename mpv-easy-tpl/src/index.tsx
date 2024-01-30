import { usePropertyBool } from "@mpv-easy/hook"
import "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import { AssColor } from "e-color"
import React from "react"
import * as ICON from "firacode-icon"

function Play() {
  const pauseIcon = ICON.Play
  const playIcon = ICON.Play
  const [pause, setPause] = usePropertyBool("pause", false)
  return (
    <Box
      x={0}
      y={0}
      // color={AssColor.Colors.Yellow.toHex()}
      text={pause ? pauseIcon : playIcon}
    />
  )
}

render(<Play />)
