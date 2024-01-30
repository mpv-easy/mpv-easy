import { BaseElementProps, Box, Button } from "@mpv-easy/ui"
import React from "react"
import * as ICON from "../../icon"
import { StoreProps } from "../../state-store"
import { pluginName } from "../../main"
import { command } from "@mpv-easy/tool"
import { pluginName as i18nName } from "@mpv-easy/i18n"

export function Info({
  store,
  dispatch,
  height,
}: StoreProps & Partial<BaseElementProps>) {
  const { mode, style } = store[pluginName]

  const button = style[mode].button.default
  const control = style[mode].control

  const language = store[i18nName].default
  const uiName = store[pluginName].name

  const i18n = store[i18nName].lang[language]
  const fileName = store[pluginName].player.path.split("/").at(-1)

  const isPause = store[pluginName].player.pause
  return (
    <Box
      id="osc-info"
      display="flex"
      font={button.font}
      fontSize={button.fontSize}
      backgroundColor={control.backgroundColor}
      color={button.color}
      height={height}
      width={"100%"}
      flexDirection="column"
      justifyContent="start"
      alignItems="end"
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

      <Box
        height={button.height}
        display="flex"
        justifyContent="start"
        alignItems="center"
        text={fileName}
        padding={button.padding}
      />
    </Box>
  )
}
