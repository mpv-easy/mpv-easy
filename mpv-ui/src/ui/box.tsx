import React from "react"
import { forwardRef } from "react"
import type { MpDom } from "../render/dom"

export type Ref = MpDom

export const Box = forwardRef<
  Ref,
  Partial<MpDom["attributes"] & { children?: React.ReactNode }>
>((props, ref) => {
  // @ts-ignore
  return props.display !== "none" && <mpv-box ref={ref} {...props} />
})
