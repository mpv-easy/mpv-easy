import { Box } from "@mpv-easy/react"
import React from "react"

export function BoxBold() {
  return (
    <Box
      id="box-main"
      width={"50%"}
      height={"50%"}
      display="flex"
      backgroundColor="#000000A0"
      justifyContent="center"
      alignItems="center"
      fontSize={50}
    >
      <Box text="AAA" color="#00FF00" fontWeight="normal" />
      <Box text="AAA" color="#00FF00" fontWeight="bold" />
    </Box>
  )
}

export default BoxBold
