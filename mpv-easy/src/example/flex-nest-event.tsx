import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

function createHandler(id: string | number) {
  return {
    onMouseDown: () => {
      console.log('down: ', id)
    },
    onMouseEnter: () => {
      console.log('enter: ', id)
    },
    onMouseLeave: () => {
      console.log('leave: ', id)
    },
    onMouseMove: () => {
      console.log('move: ', id)
    },
    onMousePress: () => {
      console.log('press: ', id)
    },
    onMouseUp: () => {
      console.log('up: ', id)
    }
  }
}
function Flex() {
  return (
    <Box
      id="flex-main"
      width={"50%"}
      height={"50%"}
      backgroundColor="FF0000"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"

      {...createHandler(1)}
    >
      <Box
        id="flex-1"
        width={"50%"}
        height={"50%"}
        backgroundColor="0000FF"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        {...createHandler(2)}
      >
        <Box
          id="flex-2"
          width={"50%"}
          height={"50%"}
          backgroundColor="00FFFF"
          display="flex"
          {...createHandler(3)}
        ></Box>
      </Box>
    </Box>
  )
}

render(<Flex />)
