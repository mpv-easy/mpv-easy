import { Box } from "@mpv-easy/react"
import React from "react"

export function FlexSize() {
  return (
    <Box
      id="flexMain"
      width={"50%"}
      height={"50%"}
      backgroundColor="#FF0000"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box id="flex_1" width={"50%"} height={"50%"} backgroundColor="#00FF00" />
      <Box id="flex_2" width={100} height={100} backgroundColor="#0000FF" />
      <Box id="flex_3" width={100} height={200} backgroundColor="#0FFFF0" />
    </Box>
  )
}
