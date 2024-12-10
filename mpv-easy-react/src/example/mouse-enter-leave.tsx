import { Box } from "@mpv-easy/react"
import React from "react"

export function MouseEnterLeave() {
  return (
    <Box
      id="main"
      position="relative"
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        id="box1"
        width={50}
        height={50}
        backgroundColor="#00FF00"
        onMouseDown={({ x, y, offsetX, offsetY }) => {
          console.log("main: ", x, y, offsetX, offsetY)
        }}
        onMouseEnter={(e) => {
          console.log("onMouseEnter", e.target?.attributes.id)
        }}
        onMouseLeave={(e) => {
          console.log("onMouseLeave", e.target?.attributes.id)
        }}
        onMouseMove={({ x, y, offsetX, offsetY }) => {
          console.log("hover-box: ", x, y, offsetX, offsetY)
        }}
      />

      <Box id="box2" width={50} height={50} backgroundColor="#FF0000" />
    </Box>
  )
}
