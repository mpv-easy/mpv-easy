import React, { forwardRef } from "react"
import { Progress } from "../progress"
import { Box, DOMElement, BaseElementProps } from "@mpv-easy/ui"
import { Control } from "./control"
import { pluginName } from "../../main"
import { useSelector } from "react-redux"
import {
  RootState,
  buttonStyleSelector,
  fontSizeSelector,
  progressStyleSelector,
} from "../../store"

export const Uosc = React.memo(
  forwardRef<DOMElement, Partial<BaseElementProps>>((props, ref) => {
    const button = useSelector(buttonStyleSelector)
    const padding = button.padding
    const h = button.height + padding * 2

    return (
      <Box
        width={"100%"}
        height={h * 2 + padding * 4}
        display="flex"
        flexDirection="row"
        hide={props.hide}
        ref={ref}
        id="uosc"
        justifyContent="end"
      >
        <Control {...props} width={"100%"} height={h} />
        <Progress {...props} width={"100%"} height={h} />
      </Box>
    )
  }),
)
