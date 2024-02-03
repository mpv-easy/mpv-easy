import { dispatchEvent, RootNode } from "@mpv-easy/ui/src/render/flex"
import { addForcedKeyBinding } from "../../../mpv-tool/src/mpv"
import { PropertyNative } from "../../../mpv-tool/src/property"
import { MousePos } from "../../../mpv-tool/src/type"
import { Box, render } from "@mpv-easy/ui"
import React, { useEffect } from "react"

const mousePosProp = new PropertyNative<MousePos>("mouse-pos")

export const VoiceControl = () => {
  console.log("----------video")
  useEffect(() => {
    addForcedKeyBinding(
      "MOUSE_BTN3",
      "__MOUSE_BTN3__RENDER__",
      (event) => {
        // down
        dispatchEvent(RootNode, mousePosProp.value, event)
        // console.log("up", JSON.stringify(event))
      },
      {
        complex: true,
        repeatable: true,
        forced: true,
      },
    )

    addForcedKeyBinding(
      "MOUSE_BTN4",
      "__MOUSE_BTN3__RENDER__",
      (event) => {
        // console.log("down", JSON.stringify(event))
        dispatchEvent(RootNode, mousePosProp.value, event)
      },
      {
        complex: true,
        repeatable: true,
        forced: true,
      },
    )
  }, [])
  console.log("==========:")
  return (
    <Box
      x={0}
      y={0}
      // position='relative'
      // display="flex"
      // flexDirection="row"
      // justifyContent="start"
      // alignItems="start"
      width={500}
      height={500}
      backgroundColor="00FF00A0"
    >
      {Array(10)
        .fill(0)
        .map(() => (
          <Box
            width={100}
            height={100}
            color="FFFFFF"
            backgroundColor="000000"
          />
        ))}
    </Box>
  )
}

render(<VoiceControl />)
