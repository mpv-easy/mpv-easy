import {
  BaseElementProps,
  Box,
  Button,
  DOMElement,
  Dropdown,
} from "@mpv-easy/ui"
import React, { forwardRef, useState } from "react"
import * as ICON from "../icon"
import { pluginName } from "../main"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { command } from "@mpv-easy/tool"
import { useDispatch, useSelector } from "react-redux"
import { RootStore, Dispatch } from "../store"
import { throttle } from "lodash-es"

export const Toolbar = React.memo(
  forwardRef<DOMElement, Partial<BaseElementProps>>(({ hide }, ref) => {
    const fullscreen = useSelector(
      (store: RootStore) => store.context[pluginName].player.fullscreen,
    )
    const mode = useSelector(
      (store: RootStore) => store.context[pluginName].mode,
    )
    const language = useSelector(
      (store: RootStore) => store.context[i18nName].default,
    )
    const i18n = useSelector(
      (store: RootStore) => store.context[i18nName].lang[language],
    )
    const button = useSelector(
      (store: RootStore) =>
        store.context[pluginName].style[mode].button.default,
    )

    const dropdown = useSelector(
      (store: RootStore) => store.context[pluginName].style[mode].dropdown,
    )

    const toolbar = useSelector(
      (store: RootStore) => store.context[pluginName].style[mode].toolbar,
    )
    const dispatch = useDispatch<Dispatch>()
    const mouseHoverStyle = useSelector(
      (store: RootStore) => store.context.experimental.mouseHoverStyle,
    )
    const mousePosThrottle = useSelector(
      (store: RootStore) => store.context[pluginName].state.mousePosThrottle,
    )
    const setTooltip = throttle(dispatch.context.setTooltip, mousePosThrottle, {
      leading: false,
      trailing: true,
    })

    return (
      <Box
        id="toolbar"
        ref={ref}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        top={0}
        font={button.font}
        fontSize={button.fontSize}
        color={button.color}
        width={"100%"}
        hide={hide}
      >
        <Box
          display="flex"
          justifyContent="start"
          alignItems="center"
          backgroundColor={toolbar.backgroundColor}
          color={button.color}
          id="toolbar-left"
        >
          <Dropdown
            id="toolbar-theme"
            text={ICON.ThemeLightDark}
            items={[
              {
                key: "light",
                label: i18n.lightName,
                onSelect: () => {
                  dispatch.context.setMode("light")
                },
              },
              {
                key: "dark",
                label: i18n.darkName,
                onSelect: () => {
                  dispatch.context.setMode("dark")
                },
              },
            ]}
            dropdownStyle={dropdown}
            direction="bottom"
            width={button.width}
            height={button.height}
            display="flex"
            justifyContent="center"
            alignItems="center"
            enableMouseStyle={mouseHoverStyle}
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onMouseEnter={() => {
              setTooltip(false, i18n.theme)
            }}
            onMouseMove={() => {
              setTooltip(false, i18n.theme)
            }}
            onMouseLeave={() => {
              setTooltip(true, "")
            }}
          />
          <Dropdown
            // TODO: language switch icon
            text={"A/中"}
            direction="bottom"
            items={[
              {
                key: "Chinese",
                label: i18n.languageChinese,
                onSelect: () => {
                  dispatch.context.setLanguage("cn")
                },
              },
              {
                key: "English",
                label: i18n.languageEnglish,
                onSelect: () => {
                  dispatch.context.setLanguage("en")
                },
              },
            ]}
            height={button.height}
            display="flex"
            justifyContent="center"
            alignItems="center"
            dropdownStyle={dropdown}
            enableMouseStyle={mouseHoverStyle}
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onMouseEnter={() => {
              setTooltip(false, i18n.language)
            }}
            onMouseMove={() => {
              setTooltip(false, i18n.language)
            }}
            onMouseLeave={() => {
              setTooltip(true, "")
            }}
          />

          <Dropdown
            direction="bottom"
            items={[
              {
                key: "osc",
                label: i18n.osc,
                onSelect: () => {
                  dispatch.context.setUI("osc")
                },
              },
              {
                key: "uosc",
                label: i18n.uosc,
                onSelect: () => {
                  dispatch.context.setUI("uosc")
                },
              },
            ]}
            dropdownStyle={dropdown}
            text={i18n.skin}
            height={button.height}
            display="flex"
            justifyContent="center"
            alignItems="center"
            enableMouseStyle={mouseHoverStyle}
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onMouseEnter={() => {
              setTooltip(false, i18n.ui)
            }}
            onMouseMove={() => {
              setTooltip(false, i18n.ui)
            }}
            onMouseLeave={() => {
              setTooltip(true, "")
            }}
          />
        </Box>

        {fullscreen ? (
          <Box
            display="flex"
            font={button.font}
            justifyContent="end"
            alignItems="center"
            backgroundColor={toolbar.backgroundColor}
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
              text={ICON.ChromeMinimize}
              backgroundColor={button.backgroundColor}
              font={button.font}
              fontSize={button.fontSize}
              color={button.color}
              onMouseDown={() => {
                dispatch.context.setWindowMinimized(true)
              }}
              onMouseEnter={() => {
                setTooltip(false, i18n.minimize)
              }}
              onMouseMove={() => {
                setTooltip(false, i18n.minimize)
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
              padding={button.padding}
              colorHover={button.colorHover}
              backgroundColorHover={button.backgroundColorHover}
              text={ICON.ChromeRestore}
              backgroundColor={button.backgroundColor}
              font={button.font}
              fontSize={button.fontSize}
              color={button.color}
              onMouseDown={() => {
                dispatch.context.setFullscreen(false)
              }}
              onMouseEnter={() => {
                setTooltip(false, i18n.restore)
              }}
              onMouseMove={() => {
                setTooltip(false, i18n.restore)
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
              padding={button.padding}
              colorHover={button.colorHover}
              backgroundColorHover={button.backgroundColorHover}
              text={ICON.ChromeClose}
              backgroundColor={button.backgroundColor}
              font={button.font}
              fontSize={button.fontSize}
              color={button.color}
              onMouseDown={() => {
                command("quit")
              }}
              onMouseEnter={() => {
                setTooltip(false, i18n.close)
              }}
              onMouseMove={() => {
                setTooltip(false, i18n.close)
              }}
              onMouseLeave={() => {
                setTooltip(true, "")
              }}
            />
          </Box>
        ) : (
          <></>
        )}
      </Box>
    )
  }),
)
