import { dispatchEvent, getRootNode } from "@mpv-easy/react"
import { Box } from "@mpv-easy/react"
import React, { useEffect, useRef } from "react"
import {
  PropertyNative,
  type MousePos,
  addForcedKeyBinding,
} from "@mpv-easy/tool"
import { usePropertyNumber } from "@mpv-easy/react"

const mousePosProp = new PropertyNative<MousePos>("mouse-pos")

export function VolumeControl() {
  const [volume, setVolume] = usePropertyNumber("volume", 100)
  const h = useRef<((x: number) => void) | null>(null)
  h.current = (x) => {
    setVolume(volume + x)
  }
  useEffect(() => {
    addForcedKeyBinding(
      "MOUSE_BTN3",
      "__MOUSE_BTN3_UP__",
      (event) => {
        console.log("volume up")
        dispatchEvent(getRootNode(), mousePosProp.value!, event)
        h.current?.(10)
      },
      {
        complex: true,
        repeatable: true,
        forced: true,
      },
    )

    addForcedKeyBinding(
      "MOUSE_BTN4",
      "__MOUSE_BTN3_DOWN__",
      (event) => {
        console.log("volume down")
        dispatchEvent(getRootNode(), mousePosProp.value!, event)
        h.current?.(-10)
      },
      {
        complex: true,
        repeatable: true,
        forced: true,
      },
    )
  }, [])
  return <Box text={`volume: ${volume}`} />
}
