import { BaseElementProps, Box, Button } from "@mpv-easy/ui"
import React from "react"
import * as ICON from "../../icon"
import { StoreProps } from "../../state-store"
import { pluginName } from "../../main"
import { command } from "@mpv-easy/tool"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { Progress } from "../uosc/progress"

export function Control({
  store,
  dispatch,
  height,
  width,
  t,
}: StoreProps & Partial<BaseElementProps>) {
  const { mode, style } = store[pluginName]

  const button = style[mode].button.default
  const control = style[mode].control

  const language = store[i18nName].default
  const uiName = store[pluginName].name

  const i18n = store[i18nName].lang[language]
  const fileName = store[pluginName].player.path.split("/").at(-1)

  const isPause = store[pluginName].player.pause
  const isMute = store[pluginName].player.mute
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
      justifyContent="start"
      alignItems="center"
    >
      <Box
        id="osc-control-buttons"
        display="flex"
        justifyContent="start"
        alignItems="end"
        backgroundColor={control.backgroundColor}
        height={height}
        width={"15%"}
      >
        <Button
          width={button.width}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          enableMouseStyle={store.experimental.mouseHoverStyle}
          text={isPause ? ICON.Play : ICON.Pause}
          padding={button.padding}
          onMouseDown={() => {
            dispatch.setPause(!store[pluginName].player.pause)
          }}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          onMouseEnter={() => {
            dispatch.setTooltip(false, isPause ? i18n.play : i18n.pause)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, isPause ? i18n.play : i18n.pause)
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
        />
        <Button
          width={button.width}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          text={ICON.Stop}
          enableMouseStyle={store.experimental.mouseHoverStyle}
          padding={button.padding}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          onMouseDown={() => {
            dispatch.setPause(true)
            dispatch.setTimePos(0)
          }}
          onMouseEnter={() => {
            dispatch.setTooltip(false, i18n.stop)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, i18n.stop)
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
        ></Button>

        <Button
          width={button.width}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          enableMouseStyle={store.experimental.mouseHoverStyle}
          text={ICON.Camera}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          padding={button.padding}
          onMouseDown={() => {
            dispatch.screenshot()
          }}
          onMouseEnter={() => {
            dispatch.setTooltip(false, i18n.screenshot)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, i18n.screenshot)
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
        />
      </Box>
      <Progress
        store={store}
        dispatch={dispatch}
        t={t}
        width={"60%"}
        height={height || 0}
      />
      <Box
        id="osc-control-buttons"
        display="flex"
        justifyContent="end"
        alignItems="end"
        backgroundColor={control.backgroundColor}
        height={height}
        width={"15%"}
        right={0}
      >
        <Button
          width={button.width}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          enableMouseStyle={store.experimental.mouseHoverStyle}
          padding={button.padding}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          text={isMute ? ICON.Unmute : ICON.Mute}
          onMouseEnter={() => {
            dispatch.setTooltip(false, isMute ? i18n.unmute : i18n.mute)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, isMute ? i18n.unmute : i18n.mute)
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
          onMouseDown={() => {
            dispatch.setMute(!store[pluginName].player.mute)
          }}
        />
        <Button
          width={button.width}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          enableMouseStyle={store.experimental.mouseHoverStyle}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          text={ICON.ChromeMaximize}
          padding={button.padding}
          onMouseDown={() => {
            dispatch.setFullscreen(true)
          }}
          onMouseEnter={() => {
            dispatch.setTooltip(false, i18n.fullscreen)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, i18n.fullscreen)
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
        />
      </Box>
    </Box>
  )
}
