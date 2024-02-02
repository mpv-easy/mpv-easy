import { BaseElementProps, Box, Button } from "@mpv-easy/ui"
import React from "react"
import * as ICON from "../../icon"
import { pluginName } from "../../main"
import { command } from "@mpv-easy/tool"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { useSelector, useDispatch } from "react-redux"
import {
  RootState,
  Dispatch,
  buttonStyleSelector,
  controlStyleSelector,
} from "../../store"
import { throttle } from "lodash-es"
import { Previous } from "../components/previous"
import { Next } from "../components/next"
import { Filename } from "../components/filename"

export const Info = React.memo(({ height }: Partial<BaseElementProps>) => {
  const button = useSelector(buttonStyleSelector)
  const control = useSelector(controlStyleSelector)
  return (
    <Box
      id="osc-info"
      display="flex"
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      height={height}
      width={"100%"}
      flexDirection="column"
      justifyContent="start"
      alignItems="center"
      backgroundColor={control.backgroundColor}
    >
      <Previous />
      <Next />
      <Filename />
    </Box>
  )
})
