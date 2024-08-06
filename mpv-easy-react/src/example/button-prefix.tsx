import { Box, Button } from "@mpv-easy/react"
import React from "react"

const button = {
  color: "FFFFFF",
  backgroundColor: "000000",
  colorHover: "00FFFF",
  backgroundColorHover: "233233",
  fontSize: 64,
}

export function ButtonPrefix() {
  return (
    <Box
      id="flex-main"
      width={"50%"}
      height={"50%"}
      backgroundColor="FF0000"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        id="flex-1"
        width={"50%"}
        height={"50%"}
        backgroundColor="0000FF"
        display="flex"
        flexDirection="row"
        justifyContent="start"
        alignItems="start"
        alignContent="stretch"
      >
        <Button
          id="play"
          text="play"
          {...button}
          postfix={">"}
          display="flex"
          justifyContent="space-between"
          onMouseDown={(e) => {
            console.log("play click: ", e.target?.attributes.id)
          }}
        />
        {/* <Button
          id="exit"
          text="exit"
          {...button}
          postfix={undefined}
          onMouseDown={(e) => {
            console.log("exit click: ", e.target.attributes.id)
          }}
        /> */}
      </Box>
    </Box>
  )
}
