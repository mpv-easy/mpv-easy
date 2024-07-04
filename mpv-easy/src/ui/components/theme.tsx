import { Dropdown } from "@mpv-easy/ui"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  type Dispatch,
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
          key: i18n.lightName,
          label: i18n.lightName,
          onSelect: () => {
            dispatch.context.setMode("light")
          },
          style: {
            ...dropdown.item,
            justifyContent: "space-between",
            alignItems: "center",
            prefix: lightPrefix,
          },
        },
        {
          key: i18n.darkName,
          label: i18n.darkName,
          onSelect: () => {
            dispatch.context.setMode("dark")
          },
          style: {
            ...dropdown.item,
            justifyContent: "space-between",
            alignItems: "center",
            prefix: darkPrefix,
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
      padding={dropdown.button.padding}
      colorHover={dropdown.button.colorHover}
      backgroundColorHover={dropdown.button.backgroundColorHover}
      backgroundColor={dropdown.button.backgroundColor}
      font={dropdown.button.font}
      fontSize={button.fontSize}
      color={dropdown.button.color}
      dropdownListStyle={dropdown.list}
    />
  )
}
