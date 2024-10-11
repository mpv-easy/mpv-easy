import {
  type MpvPropertyTypeMap,
  getPropertyNative,
  getPropertyNumber,
  observeProperty,
  print,
} from "@mpv-easy/tool"
import { useState } from "react"

export function useOsdWidth() {
  const [width, setWidth] = useState(getPropertyNumber("osd-width") || 0)
  observeProperty("osd-width", "native", (_, value) => {
    setWidth(value)
  })
  return width
}

export function useOsdHeight() {
  const [height, setHeight] = useState(getPropertyNumber("osd-height") || 0)
  observeProperty("osd-height", "number", (_, value) => {
    setHeight(value)
  })
  return height
}

let _lastOsdW = 0
let _lastOsdH = 0
export function useOsdDimensions() {
  const [dimension, setDimension] = useState<
    MpvPropertyTypeMap["osd-dimensions"]
  >(
    getPropertyNative<MpvPropertyTypeMap["osd-dimensions"]>("osd-dimensions", {
      w: 0,
      h: 0,
    }),
  )
  observeProperty("osd-dimensions", "native", (_, value) => {
    if (value.w === _lastOsdW && value.h === _lastOsdH) {
      return dimension
    }
    _lastOsdW = value.w
    _lastOsdH = value.h
    setDimension(value)
  })
  return dimension
}
