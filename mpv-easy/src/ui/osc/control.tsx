import { BaseElementProps, Box } from "@mpv-easy/ui"
import React from "react"
import { Progress } from "../progress"
import { useSelector } from "react-redux"
import {
  buttonStyleSelector,
  controlStyleSelector,
  fullscreenSelector,
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
import { MoreInfo } from "../components/more-info"
export const OscControl = React.memo(
  ({ height, width }: Partial<BaseElementProps>) => {
    const button = useSelector(buttonStyleSelector)
    const control = useSelector(controlStyleSelector)
    const fullscreen = useSelector(fullscreenSelector)
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
          {/* <MoreInfo /> */}
          <Screenshot />
          <PlayMode />
        </Box>
        <Progress width={"60%"} height={height || 0} />
        <Box
          id="osc-control-buttons2"
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
  },
)
