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
import {
  RootState,
  Dispatch,
  buttonStyleSelector,
  toolbarStyleSelector,
  modeSelector,
  fullscreenSelector,
} from "../store"
import { throttle } from "lodash-es"
import { Language } from "./components/language"
import { Theme } from "./components/theme"
import { UI } from "./components/ui"
import { Restore } from "./components/restore"
import { Close } from "./components/close"
import { Minimize } from "./components/minimize"

export const Toolbar = React.memo(
  forwardRef<DOMElement, Partial<BaseElementProps>>(({ hide }, ref) => {
    const fullscreen = useSelector(fullscreenSelector)
    const button = useSelector(buttonStyleSelector)
    const toolbar = useSelector(toolbarStyleSelector)
    return (
      <Box
        id="toolbar"
        ref={ref}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        font={button.font}
        fontSize={button.fontSize}
        color={button.color}
        width={"100%"}
        hide={hide}
      >
        <Box
          position="relative"
          display="flex"
          justifyContent="start"
          alignItems="center"
          backgroundColor={toolbar.backgroundColor}
          color={button.color}
          id="toolbar-left"
        >
          <Theme />
          <Language />
          <UI />
        </Box>

        {fullscreen ? (
          <Box
            display="flex"
            font={button.font}
            justifyContent="end"
            alignItems="center"
            backgroundColor={toolbar.backgroundColor}
          >
            <Minimize />
            <Restore />
            <Close />
          </Box>
        ) : (
          <></>
        )}
      </Box>
    )
  }),
)
