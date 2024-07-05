import { Box, } from "@mpv-easy/ui"
import React, { useEffect, useRef, useState } from "react"

export function BoxMove() {
  const [x, setX] = useState(0)

  const h = useRef<() => void>()
  h.current = () => {
    setX(x + 100)
  }
  useEffect(() => {
    setInterval(() => h.current?.(), 200)
  }, [])

  return (
    <>
      <Box
        id="box-main"
        width={"50%"}
        height={"50%"}
        display="flex"
        backgroundColor="000000A0"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          position="absolute"
          text="aaaaaaaaaaaaa"
          color="000000"
          backgroundColor="00FFFF"
          width={200}
          height={200}
          left={x}
        />
      </Box>
    </>
  )
}
