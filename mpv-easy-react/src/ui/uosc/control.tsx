import { type MpDomProps, Box } from "@mpv-easy/react"
import React from "react"
import {
  buttonStyleSelector,
  controlSelector,
  fontSelector,
  fullscreenSelector,
  normalFontSizeSelector,
  mountSelector,
} from "../../store"
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
import { History } from "../components/history"
import { useSelector } from "../../models"
import { Mount } from "../components/mount"

export const UoscControl = (props: Partial<MpDomProps>) => {
  const { width, height } = props
  const button = useSelector(buttonStyleSelector)
  const control = useSelector(controlSelector)
  const fontSize = useSelector(normalFontSizeSelector)
  const font = useSelector(fontSelector)
  const fullscreen = useSelector(fullscreenSelector)
  const mount = useSelector(mountSelector)
  return (
    <Box
      id="uosc-control"
      display="flex"
      font={font}
      fontSize={fontSize.fontSize}
      color={button.color}
      width={width}
      height={height}
      justifyContent="space-between"
      alignItems="center"
    >
      <Box
        id="uosc-control-left"
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
        id="uosc-control-right"
        display="flex"
        height={height}
        justifyContent="start"
        alignItems="center"
        backgroundColor={control.backgroundColor}
      >
        <PlayMode />
        <Previous />
        {!!mount?.length && <Mount />}
        <Playlist />
        <Next />
        {fullscreen ? <Restore /> : <Fullscreen />}
      </Box>
    </Box>
  )
}
