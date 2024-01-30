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
import { Store, StoreProps } from "../../state-store"
import { pluginName } from "../../main"

export const Uosc = forwardRef<
  DOMElement,
  StoreProps & Partial<BaseElementProps>
>((props, ref) => {
  const mode = props.store[pluginName].mode
  const height = props.store[pluginName].style[mode].progress.height
  const padding = props.store[pluginName].style[mode].button.default.padding
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
})
