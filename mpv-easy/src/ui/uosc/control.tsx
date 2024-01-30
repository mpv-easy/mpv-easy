import { BaseElementProps, Box, Button } from "@mpv-easy/ui"
import React from "react"
import * as ICON from "../../icon"
import { StoreProps } from "../../state-store"
import { pluginName } from "../../main"
import { command } from "@mpv-easy/tool"
import { pluginName as i18nName } from "@mpv-easy/i18n"

export function Control({
  store,
  dispatch,
}: StoreProps & Partial<BaseElementProps>) {
  const { mode, style } = store[pluginName]

  const button = style[mode].button.default
  const control = style[mode].control

  const language = store[i18nName].default
  const uiName = store[pluginName].name

  const i18n = store[i18nName].lang[language]

  const isPause = store[pluginName].player.pause
  return (
    <Box
      id="uosc-control"
      display="flex"
      font={button.font}
      fontSize={button.fontSize}
      backgroundColor={control.backgroundColor}
      color={button.color}
      width={"100%"}
    >
      <Box
        display="flex"
        width={"50%"}
        justifyContent="start"
        backgroundColor={control.backgroundColor}
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

      <Box
        display="flex"
        width={"50%"}
        justifyContent="end"
        backgroundColor={control.backgroundColor}
      >
        <Button
          width={button.width}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          enableMouseStyle={store.experimental.mouseHoverStyle}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          text={ICON.Random}
          padding={button.padding}
          onMouseEnter={() => {
            dispatch.setTooltip(false, i18n.randomPlay)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, i18n.randomPlay)
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
          enableMouseStyle={store.experimental.mouseHoverStyle}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          text={ICON.ChevronLeft}
          padding={button.padding}
          onMouseDown={() => {
            command("playlist-prev")
          }}
          onMouseEnter={() => {
            dispatch.setTooltip(false, i18n.previous)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, i18n.previous)
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
        />
        {/* <Button
          enableMouseStyle={store.experimental.mouseHoverStyle}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          text={ICON.PlaylistPlay}
          padding={button.padding}
        /> */}
        <Button
          width={button.width}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          enableMouseStyle={store.experimental.mouseHoverStyle}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          text={ICON.ChevronRight}
          padding={button.padding}
          onMouseDown={() => {
            command("playlist-next")
          }}
          onMouseEnter={() => {
            dispatch.setTooltip(false, i18n.next)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, i18n.next)
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
