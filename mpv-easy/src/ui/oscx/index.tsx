import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  forwardRef,
  MemoExoticComponent,
} from "react"
import { Box, type MpDomProps, type MpDom } from "@mpv-easy/ui"
import { useSelector } from "react-redux"
import { IconButtonSizeSelector } from "../../store"
import { Progress } from "../progress"
import { OscInfo } from "./info"
export * from "./info"

export const Oscx: MemoExoticComponent<
  ForwardRefExoticComponent<
    PropsWithoutRef<Partial<MpDomProps>> & RefAttributes<MpDom>
  >
> = React.memo(
  forwardRef<MpDom, MpDomProps>((props, ref) => {
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
        {/* TODO: event dispatch follow zIndex order */}
        <OscInfo bottom={0} {...props} width={"100%"} height={h} />
        <Progress bottom={h} width={"100%"} height={h} />
      </Box>
    )
  }),
)
