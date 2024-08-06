import { Button } from "@mpv-easy/react"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  type Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
  playlistHideSelector,
} from "../../store"

export const Playlist = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const playlistHide = useSelector(playlistHideSelector)
  return (
    <Button
      text={ICON.PlaylistPlay}
      id="mpv-easy-button-playlist"
      title={i18n.playlist}
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      colorHover={button.colorHover}
      backgroundColorHover={button.backgroundColorHover}
      padding={button.padding}
      backgroundColor={button.backgroundColor}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      onMouseDown={(e) => {
        dispatch.context.setHistoryHide(true)
        dispatch.context.setPlaylistHide(!playlistHide)
        e.stopPropagation()
      }}
    />
  )
}
