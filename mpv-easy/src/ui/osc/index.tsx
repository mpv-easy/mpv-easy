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
import { RootStore } from "../../store"

export const Osc = React.memo(
  forwardRef<DOMElement, Partial<BaseElementProps>>((props, ref) => {
    const mode = useSelector(
      (store: RootStore) => store.context[pluginName].mode,
    )
    const height = useSelector(
      (store: RootStore) =>
        store.context[pluginName].style[mode].progress.height,
    )
    const padding = useSelector(
      (store: RootStore) =>
        store.context[pluginName].style[mode].button.default.padding,
    )

    return (
      <Box
        width={"100%"}
        height={height * 2 + padding * 2}
        display="flex"
        flexDirection="row"
        bottom={0}
        hide={props.hide}
        ref={ref}
        justifyContent="end"
        alignItems="end"
        id="osc"
      >
        <Info {...props} width={"100%"} height={height} bottom={height} />
        <Control {...props} width={"100%"} height={height} />
      </Box>
    )
  }),
)
