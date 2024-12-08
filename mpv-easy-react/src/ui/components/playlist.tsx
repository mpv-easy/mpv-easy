import { Button } from "@mpv-easy/react"
import React from "react"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  playlistHideSelector,
} from "../../store"
import { dispatch, useSelector } from "../../models"

export const Playlist = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
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
        dispatch.setHistoryHide(true)
        dispatch.setPlaylistHide(!playlistHide)
        e.stopPropagation()
      }}
    />
  )
}
