import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/react"
import React, { useEffect, useState } from "react"

export function BoxHide() {
  const [hide, setHide] = useState(false)
  return (
    <Box id="b1" width={"50%"} height={"50%"} backgroundColor="FF0000">
      <Box
        id="b2"
        width={"50%"}
        height={"50%"}
        backgroundColor="00FF00"
        hide={hide}
      >
        <Box
          id="b3"
          width={"50%"}
          height={"50%"}
          backgroundColor="0000FF"
          onMouseDown={() => {
            console.log("---down: ")
            setHide((c) => !c)
          }}
        />
      </Box>
    </Box>
  )
}
