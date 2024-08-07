import {
  // ColorFormat,
  getPropertyBool,
  getPropertyNumber,
  observeProperty,
  setPropertyBool,
} from "@mpv-easy/tool"
import React, { useState } from "react"

export function usePause(defaultValue = getPropertyBool("pause")) {
  const [pause, setPause] = useState(!!defaultValue)

  return [
    pause,
    (value: boolean) => {
      setPropertyBool("pause", value)
      setPause(value)
    },
  ] as const
}

export function useTimePos() {
  const [timePos, setTimePos] = useState(0)
  observeProperty("time-pos", "number", (_, value) => {
    setTimePos(value)
  })
  return [timePos, setTimePos]
}

// export function useColorFormat() {
//   const [prop, setProp] = useState(ColorFormat.Bgra)
//   return [[prop, setProp]]
// }
