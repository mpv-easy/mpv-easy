import { BaseElementProps, Box, Button } from "@mpv-easy/ui"
import React from "react"
import * as ICON from "../../icon"
import { pluginName } from "../../main"
import { command } from "@mpv-easy/tool"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { useSelector, useDispatch } from "react-redux"
import { RootStore, Dispatch } from "../../store"
import { throttle } from "lodash-es"

export const Info = React.memo(({ height }: Partial<BaseElementProps>) => {
  const mode = useSelector((store: RootStore) => store.context[pluginName].mode)
  const button = useSelector(
    (store: RootStore) => store.context[pluginName].style[mode].button.default,
  )
  const control = useSelector(
    (store: RootStore) => store.context[pluginName].style[mode].control,
  )
  const language = useSelector(
    (store: RootStore) => store.context[i18nName].default,
  )
  const uiName = useSelector(
    (store: RootStore) => store.context[pluginName].name,
  )
  const i18n = useSelector(
    (store: RootStore) => store.context[i18nName].lang[language],
  )
  const pause = useSelector(
    (store: RootStore) => store.context[pluginName].player.pause,
  )
  const fileName = useSelector((store: RootStore) =>
    store.context[pluginName].player.path.split("/").at(-1),
  )
  const mouseHoverStyle = useSelector(
    (store: RootStore) => store.context.experimental.mouseHoverStyle,
  )
  const dispatch = useDispatch<Dispatch>()
  const mousePosThrottle = useSelector(
    (store: RootStore) => store.context[pluginName].state.mousePosThrottle,
  )
  const setTooltip = throttle(dispatch.context.setTooltip, mousePosThrottle, {
    leading: false,
    trailing: true,
  })
  return (
    <Box
      id="osc-info"
      display="flex"
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      height={height}
      width={"100%"}
      flexDirection="column"
      justifyContent="start"
      alignItems="center"
      backgroundColor={control.backgroundColor}
    >
      <Button
        width={button.width}
        height={button.height}
        display="flex"
        justifyContent="center"
        alignItems="center"
        enableMouseStyle={mouseHoverStyle}
        colorHover={button.colorHover}
        backgroundColorHover={button.backgroundColorHover}
        text={ICON.ChevronLeft}
        padding={button.padding}
        backgroundColor={button.backgroundColor}
        font={button.font}
        fontSize={button.fontSize}
        color={button.color}
        onMouseDown={() => {
          command("playlist-prev")
        }}
        onMouseEnter={() => {
          setTooltip(false, i18n.previous)
        }}
        onMouseMove={() => {
          setTooltip(false, i18n.previous)
        }}
        onMouseLeave={() => {
          setTooltip(true, "")
        }}
      />
      <Button
        width={button.width}
        height={button.height}
        display="flex"
        justifyContent="center"
        alignItems="center"
        enableMouseStyle={mouseHoverStyle}
        colorHover={button.colorHover}
        backgroundColorHover={button.backgroundColorHover}
        text={ICON.ChevronRight}
        padding={button.padding}
        backgroundColor={button.backgroundColor}
        font={button.font}
        fontSize={button.fontSize}
        color={button.color}
        onMouseDown={() => {
          command("playlist-next")
        }}
        onMouseEnter={() => {
          setTooltip(false, i18n.next)
        }}
        onMouseMove={() => {
          setTooltip(false, i18n.next)
        }}
        onMouseLeave={() => {
          setTooltip(true, "")
        }}
      />

      <Box
        height={button.height}
        display="flex"
        justifyContent="start"
        alignItems="center"
        text={fileName}
        padding={button.padding}
        backgroundColor={button.backgroundColor}
        font={button.font}
        fontSize={button.fontSize}
        color={button.color}
      />
    </Box>
  )
})
