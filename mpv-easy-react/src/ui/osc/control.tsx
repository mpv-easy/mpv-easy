import { type MpDomProps, Box } from "@mpv-easy/react"
import React from "react"
import { Progress } from "../progress"
import {
  buttonStyleSelector,
  controlStyleSelector,
  fontSelector,
  fullscreenSelector,
  normalFontSizeSelector,
} from "../../store"
import { Play } from "../components/play"
import { Stop } from "../components/stop"
import { Screenshot } from "../components/screenshot"
import { Fullscreen } from "../components/fullscreen"
import { Playlist } from "../components/playlist"
import { Restore } from "../components/restore"
import { AudioTrack } from "../components/audio-track"
import { SubtitleTrack } from "../components/subtitle-track"
import { PlayMode } from "../components/play-mode"
import { History } from "../components/history"
import { useSelector } from "../../models"
export const OscControl = ({ height, width }: Partial<MpDomProps>) => {
  const button = useSelector(buttonStyleSelector)
  const control = useSelector(controlStyleSelector)
  const fullscreen = useSelector(fullscreenSelector)
  const fontSize = useSelector(normalFontSizeSelector)
  const font = useSelector(fontSelector)

  return (
    <Box
      id="osc-control"
      display="flex"
      font={font}
      fontSize={fontSize.fontSize}
      color={button.color}
      height={height}
      width={width}
      flexDirection="column"
      justifyContent="space-between"
      backgroundColor={control.backgroundColor}
      alignItems="center"
    >
      <Box
        id="osc-control-left"
        display="flex"
        justifyContent="start"
        alignItems="center"
        height={height}
      >
        <Play />
        <Stop />
        {/* <MoreInfo /> */}
        <History />
        <Screenshot />
        <PlayMode />
        <History />
      </Box>
      <Progress width={"60%"} height={height || 0} id="osc-progress" />
      <Box
        id="osc-control-right"
        display="flex"
        justifyContent="end"
        alignItems="center"
        height={height}
      >
        <AudioTrack />
        <SubtitleTrack />
        <Playlist />
        {fullscreen ? <Restore /> : <Fullscreen />}
      </Box>
    </Box>
  )
}
