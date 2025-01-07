import { Box } from "@mpv-easy/react"
import { PropertyNative } from "@mpv-easy/tool"
import React, { useEffect, useState } from "react"

const dim = new PropertyNative("osd-dimensions")

export function OsdFullscreen() {
  const [osd, setOsd] = useState(dim.value)
  const w = osd?.w || 0
  const h = osd?.h || 0

  useEffect(() => {
    dim.observe((_, v) => {
      setOsd(v)
    })
  }, [])
  return (
    <Box
      id="box-main"
      width={w}
      height={h}
      display="flex"
      backgroundColor="#FF0000"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        id="box-text"
        text={`${osd?.w} ${osd?.h}`}
        fontSize={w / 8}
        color="#00FF00"
      />
    </Box>
  )
}

export default OsdFullscreen
