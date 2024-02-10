import React, { forwardRef } from "react"
import { Box, DOMElement, BaseElementProps } from "@mpv-easy/ui"
import { Control } from "./control"
import { pluginName } from "../../main"
import { Info } from "./info"
import { useSelector } from "react-redux"
import {
  RootState,
  buttonStyleSelector,
  fontSizeSelector,
  progressStyleSelector,
} from "../../store"

export const Osc = React.memo(
  forwardRef<DOMElement, Partial<BaseElementProps>>((props, ref) => {
    const button = useSelector(buttonStyleSelector)
    const padding = button.padding
    const h = button.height + 2 * padding

    return (
      <Box
        width={"100%"}
        height={h * 2 + padding * 4}
        display="flex"
        flexDirection="row"
        hide={props.hide}
        ref={ref}
        justifyContent="end"
        alignItems="end"
        id="osc"
        onMouseDown={(e) => e.stopPropagation}
      >
        <Info {...props} width={"100%"} height={h} />
        <Control {...props} width={"100%"} height={h} />
      </Box>
    )
  }),
)
