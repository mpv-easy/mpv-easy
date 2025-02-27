import { type MpDomProps, Box, type MpDom } from "@mpv-easy/react"
import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  forwardRef,
} from "react"
import {
  buttonStyleSelector,
  toolbarStyleSelector,
  fullscreenSelector,
  normalFontSizeSelector,
  fontSelector,
  cellSizeSelector,
} from "../store"
import { Language } from "./components/language"
import { Theme } from "./components/theme"
import { UI } from "./components/ui"
import { Restore } from "./components/restore"
import { Close } from "./components/close"
import { Minimize } from "./components/minimize"
import { Filename } from "./components/filename"
import { useSelector } from "../models"

export const Toolbar: ForwardRefExoticComponent<
  PropsWithoutRef<Partial<MpDomProps>> & RefAttributes<MpDom>
> = forwardRef<MpDom, Partial<MpDomProps>>(({ hide }, ref) => {
  const fullscreen = useSelector(fullscreenSelector)
  const button = useSelector(buttonStyleSelector)
  const toolbar = useSelector(toolbarStyleSelector)
  const fontSize = useSelector(normalFontSizeSelector)
  const font = useSelector(fontSelector)
  const h = useSelector(cellSizeSelector)
  return (
    <Box
      id="toolbar"
      ref={ref}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      font={font}
      fontSize={fontSize.fontSize}
      color={button.color}
      width={"100%"}
      hide={hide}
      height={h}
    >
      <Box
        position="relative"
        display="flex"
        justifyContent="start"
        alignItems="center"
        backgroundColor={toolbar.backgroundColor}
        height={h}
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
          id="toolbar-right"
          display="flex"
          font={font}
          justifyContent="start"
          alignItems="center"
          height={h}
          backgroundColor={toolbar.backgroundColor}
        >
          <Minimize />
          <Restore />
          <Close />
        </Box>
      )}
    </Box>
  )
})
