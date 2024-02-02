import { BaseElementProps, Box, Button, Dropdown } from "@mpv-easy/ui"
import React from "react"
import * as ICON from "../../icon"
import { pluginName } from "../../main"
import { command } from "@mpv-easy/tool"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { useSelector, useDispatch } from "react-redux"
import { store } from "../../example/redux-toolkit/store"
import { RootState, Dispatch } from "../../store"
import { throttle } from "lodash-es"
import { Play } from "../components/play"
import { Stop } from "../components/stop"
import { Screenshot } from "../components/screenshot"
import { Fullscreen } from "../components/fullscreen"
import { Next } from "../components/next"
import { Previous } from "../components/previous"
import { RandomPlay } from "../components/random-play"
import { Playlist } from "../components/playlist"
import { SubtitleTrack } from "../components/subtitle-track"
import { AudioTrack } from "../components/audio-track"

export const Control = React.memo((props: Partial<BaseElementProps>) => {
  const { width, height } = props
  const mode = useSelector((store: RootState) => store.context[pluginName].mode)
  const button = useSelector(
    (store: RootState) => store.context[pluginName].style[mode].button.default,
  )
  const control = useSelector(
    (store: RootState) => store.context[pluginName].style[mode].control,
  )
  return (
    <Box
      id="uosc-control"
      display="flex"
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      width={width}
      height={height}
      justifyContent="space-between"
      alignItems="center"
    >
      <Box
        display="flex"
        justifyContent="start"
        alignItems="center"
        backgroundColor={control.backgroundColor}
      >
        <Play />
        <Stop />
        <SubtitleTrack />
        <AudioTrack />
        <Screenshot />
      </Box>

      <Box
        display="flex"
        justifyContent="end"
        alignItems="center"
        backgroundColor={control.backgroundColor}
      >
        <RandomPlay />
        <Previous />
        <Playlist />
        <Next />
        <Fullscreen />
      </Box>
    </Box>
  )
})
