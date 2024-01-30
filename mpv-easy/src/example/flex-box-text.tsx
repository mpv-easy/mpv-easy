import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, Button, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"
import { defaultFont } from "../main"

const padding = 32
const borderSize = 32
const fontSize = 64
function Flex() {
  return (
    <Box
      id="flex-main"
      width={"50%"}
      height={"50%"}
      display="flex"
      justifyContent="center"
      alignItems="center"
      backgroundColor="00FFFFC0"
      top={200}
      left={400}
    >
      <Box id="flex-1" display="flex" backgroundColor="0000FF">
        <Button
          id="flex-3-1"
          text="H"
          width={300}
          height={300}
          backgroundColor="00FF00"
          padding={padding}
          borderSize={borderSize}
          borderColor="00FFFF"
        />
        <Button
          id="flex-3-2"
          text="I"
          width={300}
          height={300}
          backgroundColor="00FF00"
          borderColor="00FFFF"
          padding={padding}
          borderSize={borderSize}
        />
        <Button
          id="flex-3-3"
          text="J"
          width={300}
          height={300}
          backgroundColor="00FF00"
          borderColor="00FFFF"
          padding={padding}
          borderSize={borderSize}
        ></Button>
      </Box>
    </Box>
  )
}
render(<Flex />)
