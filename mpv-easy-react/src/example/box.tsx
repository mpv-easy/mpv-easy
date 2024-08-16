import { Box } from "@mpv-easy/react"
import React from "react"

export function SimpleBox() {
  return (
    <>
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
          text="aaaaaaaaaaaaa"
          color="#000000"
          backgroundColor="#00FFFF"
          width={200}
          height={200}
        />
      </Box>
    </>
  )
}
