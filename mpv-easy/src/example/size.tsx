import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

function Size() {
  return (
    <Box width={"50%"} height={"50%"} backgroundColor="FF0000">
      <Box width={"50%"} height={"50%"} backgroundColor="00FF00">
        <Box width={"50%"} height={"50%"} backgroundColor="0000FF" />
      </Box>
    </Box>
  )
}

render(<Size />)
