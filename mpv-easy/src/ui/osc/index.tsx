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
import { Store, StoreProps } from "../../state-store"
import { pluginName } from "../../main"
import { Info } from "./info"

export const Osc = forwardRef<
  DOMElement,
  StoreProps & Partial<BaseElementProps>
>((props, ref) => {
  const mode = props.store[pluginName].mode
  const height = props.store[pluginName].style[mode].progress.height
  const padding = props.store[pluginName].style[mode].button.default.padding

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
})
