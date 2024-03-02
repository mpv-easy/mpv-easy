import React, { forwardRef } from "react"
import { Box, DOMElement, BaseElementProps } from "@mpv-easy/ui"
import { OscControl } from "./control"
import { pluginName } from "../../main"
import { OscInfo } from "./info"
import { useSelector } from "react-redux"
import {
  IconButtonSizeSelector,
  RootState,
  buttonStyleSelector,
  fontSizeSelector,
  progressStyleSelector,
} from "../../store"
export * from "./control"
export * from "./info"

export const Osc = React.memo(
  forwardRef<DOMElement, Partial<BaseElementProps>>((props, ref) => {
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
  }),
)
