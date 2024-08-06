import { type MpDomProps, Box } from "@mpv-easy/react"
import React from "react"
import { pluginName } from "../../main"
import { useSelector } from "react-redux"
import { type RootState, fullscreenSelector } from "../../store"
import { Play } from "../components/play"
import { Stop } from "../components/stop"
import { Screenshot } from "../components/screenshot"
import { Fullscreen } from "../components/fullscreen"
import { Next } from "../components/next"
import { Previous } from "../components/previous"
import { Playlist } from "../components/playlist"
import { SubtitleTrack } from "../components/subtitle-track"
import { AudioTrack } from "../components/audio-track"
import { Restore } from "../components/restore"
import { PlayMode } from "../components/play-mode"
import { PreviousFrame } from "../components/previous-frame"
import { NextFrame } from "../components/next-frame"
import { History } from "../components/history"

export const UoscControl = (props: Partial<MpDomProps>) => {
  const { width, height } = props
  const mode = useSelector((store: RootState) => store.context[pluginName].mode)
  const button = useSelector(
    (store: RootState) => store.context[pluginName].style[mode].button.default,
  )
  const control = useSelector(
    (store: RootState) => store.context[pluginName].style[mode].control,
  )

  const fullscreen = useSelector(fullscreenSelector)
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
        height={height}
        alignItems="center"
        backgroundColor={control.backgroundColor}
      >
        <Play />
        <Stop />
        <SubtitleTrack />
        <AudioTrack />
        <Screenshot />
        <History />
        {/* <MoreInfo /> */}
      </Box>

      <Box
        display="flex"
        height={height}
        justifyContent="end"
        alignItems="center"
        backgroundColor={control.backgroundColor}
      >
        <PlayMode />
        <PreviousFrame />
        <Previous />
        <Playlist />
        <Next />
        <NextFrame />
        {fullscreen ? <Restore /> : <Fullscreen />}
      </Box>
    </Box>
  )
}
