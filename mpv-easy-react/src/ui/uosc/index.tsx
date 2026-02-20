import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  forwardRef,
} from "react"
import { Progress } from "../progress"
import { Box, type MpDom, type MpDomProps } from "@mpv-easy/react"
import { UoscControl } from "./control"
import { cellSizeSelector } from "../../store"
import { useSelector } from "../../models"
export * from "./control"

export const Uosc: ForwardRefExoticComponent<
  PropsWithoutRef<Partial<MpDomProps>> & RefAttributes<MpDom>
> = forwardRef<MpDom, Partial<MpDomProps>>((props, ref) => {
  const h = useSelector(cellSizeSelector)
  return (
    <Box
      width={props.width}
      height={h * 2}
      display="flex"
      flexDirection="column"
      hide={props.hide}
      ref={ref}
      id="uosc"
      justifyContent="end"
      // onMouseDown={(e) => e.stopPropagation()}
    >
      <UoscControl {...props} height={h} />
      <Progress {...props} height={h} id="uosc-progress" />
    </Box>
  )
})
