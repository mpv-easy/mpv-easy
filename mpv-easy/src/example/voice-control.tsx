import { dispatchEvent, RootNode } from "@mpv-easy/ui"
import { Box } from "@mpv-easy/ui"
import React, { useEffect } from "react"
import { PropertyNative, MousePos, addForcedKeyBinding } from "@mpv-easy/tool"

const mousePosProp = new PropertyNative<MousePos>("mouse-pos")

export function VoiceControl() {
  useEffect(() => {
    addForcedKeyBinding(
      "MOUSE_BTN3",
      "__MOUSE_BTN3__RENDER__",
      (event) => {
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
  return <Box></Box>
}
