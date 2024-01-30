import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

function TextAlign() {
  return (
    <Box
      position="absolute"
      x={400}
      y={200}
      text="ABCD"
      fontSize={32}
      // width={600}
      // height={400}
      backgroundColor="FF0000"
      color="0000FF"
      justifyContent="center"
      alignItems="center"
    ></Box>
  )
}

render(<TextAlign />)
