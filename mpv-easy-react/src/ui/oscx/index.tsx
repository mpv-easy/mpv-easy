import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  forwardRef,
} from "react"
import { Box, type MpDomProps, type MpDom } from "@mpv-easy/react"
import { useSelector } from "react-redux"
import { IconButtonSizeSelector } from "../../store"
import { Progress } from "../progress"
import { OscInfo } from "./info"
export * from "./info"

export const Oscx: ForwardRefExoticComponent<
  PropsWithoutRef<Partial<MpDomProps>> & RefAttributes<MpDom>
> = forwardRef<MpDom, MpDomProps>((props, ref) => {
  const h = useSelector(IconButtonSizeSelector)

  return (
    <Box
      width={"100%"}
      height={h * 2}
      display="flex"
      flexDirection="row"
      hide={props.hide}
      ref={ref}
      justifyContent="end"
      alignItems="end"
      id="osc"
      onMouseDown={(e) => e.stopPropagation}
    >
      <Progress width={"100%"} height={h} id="oscx-progress" />
      <OscInfo {...props} width={"100%"} height={h} />
    </Box>
  )
})
