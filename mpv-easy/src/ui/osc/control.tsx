import { BaseElementProps, Box, Button } from "@mpv-easy/ui"
import React from "react"
import * as ICON from "../../icon"
import { pluginName } from "../../main"
import { command } from "@mpv-easy/tool"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { Progress } from "../progress"
import { useSelector, useDispatch } from "react-redux"
import { store } from "../../example/redux-toolkit/store"
import {
  RootState,
  Dispatch,
  buttonStyleSelector,
  modeSelector,
  controlStyleSelector,
} from "../../store"
import { throttle } from "lodash-es"
import { Play } from "../components/play"
import { Stop } from "../components/stop"
import { Screenshot } from "../components/screenshot"
import { Mute } from "../components/mute"
import { Fullscreen } from "../components/fullscreen"
import { Playlist } from "../components/playlist"
export const Control = React.memo(
  ({ height, width }: Partial<BaseElementProps>) => {
    const button = useSelector(buttonStyleSelector)
    const control = useSelector(controlStyleSelector)
    return (
      <Box
        id="osc-control"
        display="flex"
        font={button.font}
        fontSize={button.fontSize}
        color={button.color}
        height={height}
        width={width}
        flexDirection="column"
        justifyContent="space-between"
        backgroundColor={control.backgroundColor}
        alignItems="center"
      >
        <Box
          id="osc-control-buttons1"
          display="flex"
          justifyContent="start"
          alignItems="center"
          height={height}
        >
          <Play />
          <Stop />
          <Screenshot />
        </Box>
        <Progress width={"60%"} height={height || 0} />
        <Box
          id="osc-control-buttons2"
          display="flex"
          justifyContent="end"
          alignItems="center"
          height={height}
        >
          <Mute />
          <Playlist />
          <Fullscreen />
        </Box>
      </Box>
    )
  },
)
