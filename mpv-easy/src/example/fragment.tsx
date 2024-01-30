import React from "react"
import { Box, render } from "@mpv-easy/ui"

export function FragmentBox() {
  return (
    <>
      <Box id="box" width={100} height={100} backgroundColor="00FF00" />
    </>
  )
}

render(<FragmentBox></FragmentBox>)
