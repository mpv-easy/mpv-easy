import React, { forwardRef } from "react"
import { Progress } from "./progress"
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
import { RootStore } from "../../store"

export const Uosc = React.memo(
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
        height={height * 2 + padding * 4}
        display="flex"
        flexDirection="row"
        bottom={0}
        hide={props.hide}
        ref={ref}
        id="uosc"
        justifyContent="end"
      >
        <Control
          {...props}
          width={"100%"}
          height={height + padding * 2}
          bottom={height}
          left={0}
        />
        <Progress {...props} width={"100%"} height={height} />
      </Box>
    )
  }),
)
