import { type MpDomProps, Box } from "@mpv-easy/ui"
import React from "react"
import { useSelector } from "react-redux"
import {
  buttonStyleSelector,
  controlStyleSelector,
  fullscreenSelector,
} from "../../store"
import { Play } from "../components/play"
import { Screenshot } from "../components/screenshot"
import { Fullscreen } from "../components/fullscreen"
import { Next } from "../components/next"
import { Previous } from "../components/previous"
import { Playlist } from "../components/playlist"
import { SubtitleTrack } from "../components/subtitle-track"
import { AudioTrack } from "../components/audio-track"
import { PreviousFrame } from "../components/previous-frame"
import { NextFrame } from "../components/next-frame"
import { MoreInfo } from "../components/more-info"
import { History } from "../components/history"
import { PlayMode } from "../components/play-mode"
import { Restore } from "../components/restore"

export const OscInfo = ({ height }: Partial<MpDomProps>) => {
  const button = useSelector(buttonStyleSelector)
  const control = useSelector(controlStyleSelector)
  const fullscreen = useSelector(fullscreenSelector)
  return (
    <Box
      id="oscx-info"
      display="flex"
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      height={height}
      width={"100%"}
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      backgroundColor={control.backgroundColor}
    >
      <Box
        display="flex"
        justifyContent="start"
        height={height}
        alignItems="center"
      >
        <Screenshot />
        <SubtitleTrack />
        <AudioTrack />
      </Box>

      <Box
        display="flex"
        height={height}
        justifyContent="center"
        alignItems="center"
      >
        <History />
        <PreviousFrame />
        <Previous />
        <Play />
        <Next />
        <NextFrame />
        <Playlist />
      </Box>

      <Box
        display="flex"
        height={height}
        justifyContent="end"
        alignItems="center"
      >
        <PlayMode />
        <MoreInfo />
        {fullscreen ? <Restore /> : <Fullscreen />}
      </Box>
    </Box>
  )
}
