import { BaseElementProps, Box, Button, DOMElement } from "@mpv-easy/ui"
import React, { forwardRef, useState } from "react"
import * as ICON from "../icon"
import { StoreProps } from "../state-store"
import { pluginName } from "../main"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { command } from "@mpv-easy/tool"

export const Toolbar = forwardRef<
  DOMElement,
  StoreProps & Partial<BaseElementProps>
>(({ store, dispatch, hide }, ref) => {
  const config = store[pluginName]
  const { mode, style } = config
  const button = style[mode].button.default
  const toolbar = style[mode].toolbar
  const language = store[i18nName].default
  const uiName = store[pluginName].name

  const i18n = store[i18nName].lang[language]
  return (
    <Box
      id="toolbar"
      ref={ref}
      display="flex"
      top={0}
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      backgroundColor={toolbar.backgroundColor}
      width={"100%"}
      hide={hide}
    >
      <Box width={"50%"} display="flex">
        <Button
          text={mode === "dark" ? ICON.Sun : ICON.Moon}
          width={button.width}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          onMouseDown={() => {
            dispatch.setMode(mode === "dark" ? "light" : "dark")
          }}
          enableMouseStyle={store.experimental.mouseHoverStyle}
          padding={button.padding}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          onMouseEnter={() => {
            dispatch.setTooltip(
              false,
              mode === "dark" ? i18n.lightName : i18n.darkName,
            )
          }}
          onMouseMove={() => {
            dispatch.setTooltip(
              false,
              mode === "dark" ? i18n.lightName : i18n.darkName,
            )
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
        />
        <Button
          text={language === "cn" ? "en" : "cn"}
          width={button.width * 1.5}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          enableMouseStyle={store.experimental.mouseHoverStyle}
          padding={button.padding}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          onMouseDown={() => {
            dispatch.setLanguage(language === "cn" ? "en" : "cn")
          }}
          onMouseEnter={() => {
            dispatch.setTooltip(
              false,
              language === "cn" ? i18n.languageEnglish : i18n.languageChinese,
            )
          }}
          onMouseMove={() => {
            dispatch.setTooltip(
              false,
              language === "cn" ? i18n.languageEnglish : i18n.languageChinese,
            )
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
        />

        <Button
          text={uiName === "osc" ? "uosc" : "osc"}
          width={button.width * (uiName === "osc" ? 2.5 : 2)}
          height={button.height}
          display="flex"
          justifyContent="center"
          alignItems="center"
          enableMouseStyle={store.experimental.mouseHoverStyle}
          padding={button.padding}
          colorHover={button.colorHover}
          backgroundColorHover={button.backgroundColorHover}
          onMouseDown={() => {
            dispatch.setUI(uiName === "osc" ? "uosc" : "osc")
          }}
          onMouseEnter={() => {
            dispatch.setTooltip(false, uiName === "osc" ? i18n.osc : i18n.uosc)
          }}
          onMouseMove={() => {
            dispatch.setTooltip(false, uiName === "osc" ? i18n.osc : i18n.uosc)
          }}
          onMouseLeave={() => {
            dispatch.setTooltip(true, "")
          }}
        />
      </Box>

      {store[pluginName].player.fullscreen ? (
        <Box
          display="flex"
          font={button.font}
          width={"50%"}
          justifyContent="end"
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
            text={ICON.ChromeMinimize}
            onMouseDown={() => {
              dispatch.setWindowMinimized(true)
            }}
            onMouseEnter={() => {
              dispatch.setTooltip(false, i18n.minimize)
            }}
            onMouseMove={() => {
              dispatch.setTooltip(false, i18n.minimize)
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
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            text={ICON.ChromeRestore}
            onMouseDown={() => {
              dispatch.setFullscreen(false)
            }}
            onMouseEnter={() => {
              dispatch.setTooltip(false, i18n.restore)
            }}
            onMouseMove={() => {
              dispatch.setTooltip(false, i18n.restore)
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
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            text={ICON.ChromeClose}
            onMouseDown={() => {
              command("quit")
            }}
            onMouseEnter={() => {
              dispatch.setTooltip(false, i18n.close)
            }}
            onMouseMove={() => {
              dispatch.setTooltip(false, i18n.close)
            }}
            onMouseLeave={() => {
              dispatch.setTooltip(true, "")
            }}
          />
        </Box>
      ) : (
        <></>
      )}
    </Box>
  )
})
