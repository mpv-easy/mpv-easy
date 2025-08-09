import { Box } from "@mpv-easy/react"
import React from "react"

export default function MultiLine() {
  return (
    <Box
      id="box-main"
      width={"50%"}
      height={"50%"}
      display="flex"
      backgroundColor="#000000A0"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        text={"aaa\nbbb"}
        color="#FF0000"
        backgroundColor="#00FFFF10"
        width={200}
        height={200}
      />
    </Box>
  )
}
