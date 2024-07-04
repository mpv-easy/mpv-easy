import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  forwardRef,
  MemoExoticComponent,
} from "react"
import { Progress } from "../progress"
import { Box, type MpDom, type MpDomProps } from "@mpv-easy/ui"
import { UoscControl } from "./control"
import { useSelector } from "react-redux"
import { IconButtonSizeSelector } from "../../store"
export * from "./control"

export const Uosc: MemoExoticComponent<
  ForwardRefExoticComponent<
    PropsWithoutRef<Partial<MpDomProps>> & RefAttributes<MpDom>
  >
> = React.memo(
  forwardRef<MpDom, Partial<MpDomProps>>((props, ref) => {
    const h = useSelector(IconButtonSizeSelector)
    return (
      <Box
        width={"100%"}
        height={h * 2}
        display="flex"
        flexDirection="row"
        hide={props.hide}
        ref={ref}
        id="uosc"
        justifyContent="end"
        onMouseDown={(e) => e.stopPropagation}
      >
        <UoscControl {...props} width={"100%"} height={h} />
        <Progress {...props} width={"100%"} height={h} />
      </Box>
    )
  }),
)
