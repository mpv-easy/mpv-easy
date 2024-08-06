import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  forwardRef,
} from "react"
import { Box, type MpDomProps, type MpDom } from "@mpv-easy/react"
import { OscControl } from "./control"
import { OscInfo } from "./info"
import { useSelector } from "react-redux"
import { IconButtonSizeSelector } from "../../store"
export * from "./control"
export * from "./info"

export const Osc: ForwardRefExoticComponent<
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
      <OscInfo {...props} width={"100%"} height={h} />
      <OscControl {...props} width={"100%"} height={h} />
    </Box>
  )
})
