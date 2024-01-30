import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

function TextAlign() {
  return (
    <Box
      backgroundColor="FF0000"
      width={"50%"}
      height={"50%"}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        backgroundColor="0000FF"
        // width={"25%"}
        // height={"25%"}
        display="flex"
        color="000000"
        justifyContent="center"
        alignItems="center"
        text="ABC"
        fontSize={32}
      ></Box>
      <Box
        backgroundColor="0000FF"
        // width={"25%"}
        // height={"25%"}
        display="flex"
        color="000000"
        justifyContent="center"
        alignItems="center"
        text="EFG"
        fontSize={32}
      ></Box>
    </Box>
  )
}

render(<TextAlign />)
