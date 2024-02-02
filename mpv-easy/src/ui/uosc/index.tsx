import React, { forwardRef } from "react"
import { Progress } from "../progress"
import {
  Box,
  AutoHide,
  render,
  DOMElement,
  BaseElementProps,
} from "@mpv-easy/ui"
import { Control } from "./control"
import { pluginName } from "../../main"
import { useSelector } from "react-redux"
import { RootState, progressStyleSelector } from "../../store"
import { Playlist } from "../playlist"

export const Uosc = React.memo(
  forwardRef<DOMElement, Partial<BaseElementProps>>((props, ref) => {
    const mode = useSelector(
      (store: RootState) => store.context[pluginName].mode,
    )
    const progressHeight = useSelector(progressStyleSelector).height

    const padding = useSelector(
      (store: RootState) =>
        store.context[pluginName].style[mode].button.default.padding,
    )

    return (
      <Box
        width={"100%"}
        height={progressHeight * 2 + padding * 4}
        display="flex"
        flexDirection="row"
        hide={props.hide}
        ref={ref}
        id="uosc"
        justifyContent="end"
        // onMouseDown={(e) => e.stopPropagation()}
        // backgroundColor="00FF00A0"
      >
        <Control {...props} width={"100%"} />
        <Progress {...props} width={"100%"} height={progressHeight} />
      </Box>
    )
  }),
)
