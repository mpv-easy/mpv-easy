import { BaseElementProps, Box, Button } from "@mpv-easy/ui"
import React from "react"
import * as ICON from "../../icon"
import { pluginName } from "../../main"
import { command } from "@mpv-easy/tool"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { Progress } from "../uosc/progress"
import { useSelector, useDispatch } from "react-redux"
import { store } from "../../example/redux-toolkit/store"
import { RootStore, Dispatch } from "../../store"
import { throttle } from "lodash-es"

export const Control = React.memo(
  ({ height, width }: Partial<BaseElementProps>) => {
    const mode = useSelector(
      (store: RootStore) => store.context[pluginName].mode,
    )
    const button = useSelector(
      (store: RootStore) =>
        store.context[pluginName].style[mode].button.default,
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
    const mute = useSelector(
      (store: RootStore) => store.context[pluginName].player.mute,
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
          <Button
            width={button.width}
            height={button.height}
            display="flex"
            justifyContent="center"
            alignItems="center"
            enableMouseStyle={mouseHoverStyle}
            text={pause ? ICON.Play : ICON.Pause}
            padding={button.padding}
            onMouseDown={() => {
              dispatch.context.setPause(!pause)
            }}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onMouseEnter={() => {
              setTooltip(false, pause ? i18n.play : i18n.pause)
            }}
            onMouseMove={() => {
              setTooltip(false, pause ? i18n.play : i18n.pause)
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
            text={ICON.Stop}
            enableMouseStyle={mouseHoverStyle}
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onMouseDown={() => {
              dispatch.context.setPause(true)
              dispatch.context.setTimePos(0)
            }}
            onMouseEnter={() => {
              setTooltip(false, i18n.stop)
            }}
            onMouseMove={() => {
              setTooltip(false, i18n.stop)
            }}
            onMouseLeave={() => {
              setTooltip(true, "")
            }}
          ></Button>

          <Button
            width={button.width}
            height={button.height}
            display="flex"
            justifyContent="center"
            alignItems="center"
            enableMouseStyle={mouseHoverStyle}
            text={ICON.Camera}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            padding={button.padding}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onMouseDown={() => {
              dispatch.context.screenshot()
            }}
            onMouseEnter={() => {
              setTooltip(false, i18n.screenshot)
            }}
            onMouseMove={() => {
              setTooltip(false, i18n.screenshot)
            }}
            onMouseLeave={() => {
              setTooltip(true, "")
            }}
          />
        </Box>
        <Progress width={"60%"} height={height || 0} />
        <Box
          id="osc-control-buttons2"
          display="flex"
          justifyContent="end"
          alignItems="center"
          height={height}
        >
          <Button
            width={button.width}
            height={button.height}
            display="flex"
            justifyContent="center"
            alignItems="center"
            enableMouseStyle={mouseHoverStyle}
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            text={mute ? ICON.Unmute : ICON.Mute}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onMouseEnter={() => {
              setTooltip(false, mute ? i18n.unmute : i18n.mute)
            }}
            onMouseMove={() => {
              setTooltip(false, mute ? i18n.unmute : i18n.mute)
            }}
            onMouseLeave={() => {
              setTooltip(true, "")
            }}
            onMouseDown={() => {
              dispatch.context.setMute(!mute)
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
            text={ICON.ChromeMaximize}
            padding={button.padding}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onMouseDown={() => {
              dispatch.context.setFullscreen(true)
            }}
            onMouseEnter={() => {
              setTooltip(false, i18n.fullscreen)
            }}
            onMouseMove={() => {
              setTooltip(false, i18n.fullscreen)
            }}
            onMouseLeave={() => {
              setTooltip(true, "")
            }}
          />
        </Box>
      </Box>
    )
  },
)
