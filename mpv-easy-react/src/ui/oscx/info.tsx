import { type MpDomProps, Box } from "@mpv-easy/react"
import React from "react"
import {
  buttonStyleSelector,
  controlStyleSelector,
  fontSelector,
  fullscreenSelector,
  normalFontSizeSelector,
} from "../../store"
import { Play } from "../components/play"
import { Screenshot } from "../components/screenshot"
import { Fullscreen } from "../components/fullscreen"
import { Next } from "../components/next"
import { Previous } from "../components/previous"
import { Playlist } from "../components/playlist"
import { SubtitleTrack } from "../components/subtitle-track"
import { AudioTrack } from "../components/audio-track"
import { MoreInfo } from "../components/more-info"
import { History } from "../components/history"
import { PlayMode } from "../components/play-mode"
import { Restore } from "../components/restore"
import { useSelector } from "../../models"

export const OscInfo = ({ height }: Partial<MpDomProps>) => {
  const button = useSelector(buttonStyleSelector)
  const fontSize = useSelector(normalFontSizeSelector)
  const control = useSelector(controlStyleSelector)
  const fullscreen = useSelector(fullscreenSelector)
  const font = useSelector(fontSelector)
  return (
    <Box
      id="oscx-info"
      display="flex"
      font={font}
      fontSize={fontSize.fontSize}
      color={button.color}
      height={height}
      width={"100%"}
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      backgroundColor={control.backgroundColor}
    >
      <Box
        id="oscx-info-left"
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
        id="oscx-info-middle"
        display="flex"
        height={height}
        justifyContent="center"
        alignItems="center"
      >
        <History />
        {/* <PreviousFrame /> */}
        <Previous />
        <Play />
        <Next />
        {/* <NextFrame /> */}
        <Playlist />
      </Box>

      <Box
        id="oscx-info-right"
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
