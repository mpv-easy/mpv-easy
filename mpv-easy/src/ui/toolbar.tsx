import { type MpDomProps, Box, type MpDom } from "@mpv-easy/ui"
import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  forwardRef,
  MemoExoticComponent,
} from "react"
import { useSelector } from "react-redux"
import {
  buttonStyleSelector,
  toolbarStyleSelector,
  fullscreenSelector,
  fontSizeSelector,
} from "../store"
import { Language } from "./components/language"
import { Theme } from "./components/theme"
import { UI } from "./components/ui"
import { Restore } from "./components/restore"
import { Close } from "./components/close"
import { Minimize } from "./components/minimize"
import { Filename } from "./components/filename"

export const Toolbar: MemoExoticComponent<
  ForwardRefExoticComponent<
    PropsWithoutRef<Partial<MpDomProps>> & RefAttributes<MpDom>
  >
> = React.memo(
  forwardRef<MpDom, Partial<MpDomProps>>(({ hide }, ref) => {
    const fullscreen = useSelector(fullscreenSelector)
    const button = useSelector(buttonStyleSelector)
    const toolbar = useSelector(toolbarStyleSelector)
    const fontSize = useSelector(fontSizeSelector)
    return (
      <Box
        id="toolbar"
        ref={ref}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        font={button.font}
        fontSize={fontSize}
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
          <Filename />
        </Box>

        {fullscreen && (
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
        )}
      </Box>
    )
  }),
)
