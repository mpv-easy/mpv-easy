import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

function Relative() {
  return (
    <Box width={"100%"} height={"100%"}>
      <Box
        left={0}
        top={0}
        backgroundColor="FF0000"
        width={"25%"}
        height={"25%"}
      />

      <Box
        right={0}
        top={0}
        backgroundColor="00FF00"
        width={"25%"}
        height={"25%"}
      />
      <Box
        left={0}
        bottom={0}
        backgroundColor="0FF000"
        width={"25%"}
        height={"25%"}
      />
      <Box
        right={0}
        bottom={0}
        backgroundColor="0000FF"
        width={"25%"}
        height={"25%"}
      />
    </Box>
  )
}

render(<Relative />)
