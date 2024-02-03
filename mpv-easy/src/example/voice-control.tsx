import { dispatchEvent, RootNode } from "@mpv-easy/ui/src/render/flex"
import { addForcedKeyBinding } from "../../../mpv-tool/src/mpv"
import { PropertyNative } from "../../../mpv-tool/src/property"
import { MousePos } from "../../../mpv-tool/src/type"
import { Box } from "@mpv-easy/ui"
import React, { useEffect } from "react"

const mousePosProp = new PropertyNative<MousePos>("mouse-pos")

export function Voice() {
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

  return <Box></Box>
}
