import { Button, Dropdown } from "@mpv-easy/ui"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  pauseSelector,
  Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  modeSelector,
} from "../../store"

export const Theme = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)

  const dropdown = useSelector(dropdownStyleSelector)

  const mode = useSelector(modeSelector)
  const darkPrefix = mode === "dark" ? ICON.Ok : ICON.CheckboxBlankCircleOutline
  const lightPrefix =
    mode === "light" ? ICON.Ok : ICON.CheckboxBlankCircleOutline

  return (
    <Dropdown
      id="mpv-easy-button-theme"
      // text={mode === 'dark' ? ICON.Sun : ICON.Moon}
      text={ICON.ThemeLightDark}
      title={i18n.theme}
      items={[
        {
          key: "light",
          label: lightPrefix + " " + i18n.lightName,
          onSelect: () => {
            dispatch.context.setMode("light")
          },
        },
        {
          key: "dark",
          label: darkPrefix + "  " + i18n.darkName,
          onSelect: () => {
            dispatch.context.setMode("dark")
          },
        },
      ]}
      dropdownStyle={dropdown.button}
      direction="bottom"
      width={button.width}
      height={button.height}
      display="flex"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      padding={dropdown.padding}
      colorHover={dropdown.colorHover}
      backgroundColorHover={dropdown.backgroundColorHover}
      backgroundColor={dropdown.backgroundColor}
      font={dropdown.font}
      fontSize={dropdown.fontSize}
      color={dropdown.color}
      onMouseDown={(e) => {
        // e.stopPropagation()
      }}
    />
  )
}
