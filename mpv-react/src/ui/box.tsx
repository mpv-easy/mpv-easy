import React, {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from "react"
import { forwardRef } from "react"
import type { MpDom, MpDomProps } from "@mpv-easy/flex"

export const Box: ForwardRefExoticComponent<
  PropsWithoutRef<Partial<MpDomProps & { children: React.ReactNode }>> &
    RefAttributes<MpDom>
> = forwardRef<MpDom, Partial<MpDomProps & { children: React.ReactNode }>>(
  (props, ref) => {
    // @ts-ignore
    return props.display !== "none" && <mpv-box ref={ref} {...props} />
  },
)
