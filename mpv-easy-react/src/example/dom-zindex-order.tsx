import { Box } from "@mpv-easy/react"
import React from "react"

export function DomOrder() {
  return (
    <Box id="dom-order" width={"100%"} height={"100%"} display="flex">
      <Box
        id="dom"
        // zIndex={30}
        zIndex={10}
        position="absolute"
        x={100}
        y={100}
        width={200}
        height={200}
        backgroundColor="00FF00"
        onMouseDown={(e) => {
          console.log("======dom")
          // e.stopPropagation()
        }}
      />
      <Box
        id="zindex"
        zIndex={20}
        onMouseDown={(e) => {
          console.log("======zindex")
          e.stopPropagation()
        }}
        position="absolute"
        x={200}
        y={200}
        width={200}
        height={200}
        backgroundColor="FF0000"
      />
    </Box>
  )
}
