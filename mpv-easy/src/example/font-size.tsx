import React from "react"
import { Box, render } from "@mpv-easy/ui"

export function FontSize() {
  return (
    <>
      <Box
        id="box"
        fontSize={"100%"}
        color="00FF00"
        text="ABCD"
        backgroundColor="00FFFFA0"
      />
    </>
  )
}

render(<FontSize />)
