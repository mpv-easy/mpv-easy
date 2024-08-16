import { Box, type MpDom } from "@mpv-easy/react"
import React, { useEffect, useRef } from "react"
import { useUpdate } from "react-use"

const size = 100
export function BorderBoxList() {
  const ref = useRef<MpDom>(null)

  console.log(
    "ref:",
    ref.current?.layoutNode.width,
    ref.current?.layoutNode.height,
  )

  const c = useUpdate()
  useEffect(() => {
    setTimeout(c, 1000)
    c()
  }, [])
  return (
    <Box
      ref={ref}
      id="box-list"
      display="flex"
      flexDirection="column"
      justifyContent="start"
      alignItems="center"
      position="relative"
      padding={size}
      borderSize={size}
      backgroundColor="#00FF00A0"
      borderColor="#0000FFA0"
    >
      {Array(6)
        .fill(0)
        .map((_, k) => {
          return (
            <Box
              id={`box-list-${k}`}
              key={k}
              width={size}
              height={size}
              backgroundColor="#00FFFF"
              borderColor="#FF0000A0"
              borderSize={size}
              fontBorderColor="#0000FFA0"
              padding={size}
              zIndex={100}
            />
          )
        })}
    </Box>
  )
}
