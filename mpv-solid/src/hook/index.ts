import { getPropertyNative, MpvPropertyTypeMap, observeProperty } from "@mpv-easy/tool"
import { createSignal } from "solid-js"

let _lastOsdW = 0
let _lastOsdH = 0
export function useOsdDimensions() {
  const [dimension, setDimension] = createSignal<
    MpvPropertyTypeMap["osd-dimensions"]
  >(
    getPropertyNative<MpvPropertyTypeMap["osd-dimensions"]>(
      "osd-dimensions",
    ) || { w: 0, y: 0 },
  )
  observeProperty("osd-dimensions", "native", (_, value) => {
    if (value.w === _lastOsdW && value.h === _lastOsdH) {
      return
    }
    _lastOsdW = value.w
    _lastOsdH = value.h
    console.log('value',value)
    setDimension(value)
  })

  return dimension
}
