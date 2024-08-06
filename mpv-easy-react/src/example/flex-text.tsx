import { Box, Button, render } from "@mpv-easy/react"
import React from "react"

const padding = 16
const borderSize = 16
const fontSize = 32
export function FlexText() {
  return (
    <Box
      id="flex-main"
      width={"50%"}
      height={"50%"}
      display="flex"
      flexDirection="column"
      justifyContent="start"
      alignItems="end"
      backgroundColor="00FFFFC0"
      top={200}
      left={400}
    >
      <Box id="flex-1" width={"30%"} display="flex" backgroundColor="0000FF">
        <Button
          id="flex-1-1"
          text="A"
          backgroundColor="00FF00"
          padding={padding}
          borderSize={borderSize}
          borderColor="00FFFF"
        />
        <Button
          id="flex-1-2"
          text="B"
          backgroundColor="00FF00"
          borderColor="00FFFF"
          padding={padding}
          borderSize={borderSize}
        />
        <Button
          id="flex-1-3"
          text="C"
          backgroundColor="00FF00"
          borderColor="00FFFF"
          padding={padding}
          borderSize={borderSize}
        />
      </Box>

      <Box
        id="flex-2"
        width={"30%"}
        display="flex"
        backgroundColor="FF00FF"
        justifyContent="center"
      >
        <Button
          id="flex-2-1"
          text="D"
          backgroundColor="00FF00"
          padding={padding}
          borderSize={borderSize}
          borderColor="00FFFF"
        />
        <Button
          id="flex-2-2"
          text="E"
          backgroundColor="00FF00"
          borderColor="00FFFF"
          padding={padding}
          borderSize={borderSize}
        />
        <Button
          id="flex-2-3"
          text="F"
          backgroundColor="00FF00"
          borderColor="00FFFF"
          padding={padding}
          borderSize={borderSize}
        />
      </Box>

      <Box
        id="flex-3"
        width={"30%"}
        display="flex"
        backgroundColor="FFFFFF"
        justifyContent="end"
      >
        <Button
          id="flex-3-1"
          text="H"
          backgroundColor="00FF00"
          padding={padding}
          borderSize={borderSize}
          borderColor="00FFFF"
        />
        <Button
          id="flex-3-2"
          text="I"
          backgroundColor="00FF00"
          borderColor="00FFFF"
          padding={padding}
          borderSize={borderSize}
        />
        <Button
          id="flex-3-3"
          text="J"
          backgroundColor="00FF00"
          borderColor="00FFFF"
          padding={padding}
          borderSize={borderSize}
        />
      </Box>
    </Box>
  )
}
