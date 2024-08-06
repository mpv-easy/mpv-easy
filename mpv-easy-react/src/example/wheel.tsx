import React from "react"
import { Box, render } from "@mpv-easy/react"

const createHandler = (id: string | number) => {
  return {
    onWheelDown() {
      console.log("wheel down: ", id)
    },
    onWheelUp() {
      console.log("wheel up: ", id)
    },
    onMouseDown() {
      console.log("mouse down: ", id)
    },
    onMouseMove() {
      console.log("mouse move: ", id)
    },
  }
}
export const Wheel = () => {
  return (
    <Box
      id="1"
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      {...createHandler(1)}
    >
      <Box
        id={2}
        width="50%"
        height="50%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        {...createHandler(2)}
        backgroundColor="0000FFA0"
      >
        <Box
          id="3"
          width={"20%"}
          height={"20%"}
          {...createHandler(3)}
          backgroundColor="00FFFFA0"
        />

        <Box
          id="4"
          width={"20%"}
          height={"20%"}
          {...createHandler(4)}
          backgroundColor="00FFFFA0"
        />
      </Box>
    </Box>
  )
}
