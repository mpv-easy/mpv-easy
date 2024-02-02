import React, { forwardRef } from "react"
import { Progress } from "../uosc/progress"
import {
  Box,
  AutoHide,
  render,
  DOMElement,
  BaseElementProps,
} from "@mpv-easy/ui"
import { Control } from "./control"
import { pluginName } from "../../main"
import { Info } from "./info"
import { useSelector } from "react-redux"
import {
  RootState,
  buttonStyleSelector,
  progressStyleSelector,
} from "../../store"

export const Osc = React.memo(
  forwardRef<DOMElement, Partial<BaseElementProps>>((props, ref) => {
    const progressHeight = useSelector(progressStyleSelector).height

    const padding = useSelector(buttonStyleSelector).padding

    return (
      <Box
        width={"100%"}
        height={progressHeight * 2 + padding * 4}
        display="flex"
        flexDirection="row"
        hide={props.hide}
        ref={ref}
        justifyContent="end"
        alignItems="end"
        id="osc"
        onMouseDown={(e) => e.stopPropagation}
      >
        <Info {...props} width={"100%"} height={progressHeight} />
        <Control {...props} width={"100%"} height={progressHeight} />
      </Box>
    )
  }),
)
