import React, { forwardRef } from "react"
import { Progress } from "../progress"
import { Box, DOMElement, BaseElementProps } from "@mpv-easy/ui"
import { UoscControl } from "./control"
import { pluginName } from "../../main"
import { useSelector } from "react-redux"
import {
  IconButtonSizeSelector,
  RootState,
  buttonStyleSelector,
  fontSizeSelector,
  progressStyleSelector,
} from "../../store"
export * from "./control"

export const Uosc = React.memo(
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
