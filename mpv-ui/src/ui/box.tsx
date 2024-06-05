// biome-ignore lint/style/useImportType: <explanation>
import React from "react"
import { forwardRef } from "react"
import type { BaseElementProps } from "../type"
import type { DOMElement } from "../render"

export type Ref = DOMElement

export const Box = forwardRef<
  Ref,
  Partial<BaseElementProps & { children?: React.ReactNode }>
>((props, ref) => {
  // @ts-ignore
  return props.display !== "none" && <mpv-box ref={ref} {...props} />
})
