import React, { forwardRef } from "react"
import { BaseElementProps } from "../type"
import { DOMElement } from "../render"

export type Ref = DOMElement

export const Box = forwardRef<
  Ref,
  Partial<BaseElementProps & { children?: React.ReactNode }>
>((props, ref) => {
  // @ts-ignore
  return <mpv-box ref={ref} {...props} />
})
