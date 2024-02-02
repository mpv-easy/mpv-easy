import { Button } from "@mpv-easy/ui"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  pauseSelector,
  Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
  playlistHideSelector,
} from "../../store"

export const Playlist = () => {
  const button = useSelector(buttonStyleSelector)
  const pause = useSelector(pauseSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const playlistHide = useSelector(playlistHideSelector)
  return (
    <Button
      // TODO: libass update https://github.com/libass/libass/pull/729
      // text={ICON.PlaylistPlay}
      text={ICON.Checklist}
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
        // console.log("playlistHide: ", playlistHide)

        dispatch.context.setPlaylistHide(!playlistHide)
        // TODO: use same way to hide playlist
        e.stopPropagation()
      }}
    />
  )
}
