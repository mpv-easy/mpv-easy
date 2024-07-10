import { Dropdown, DropdownItem } from "@mpv-easy/ui"
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
import { ThemeModeList } from "../../mpv-easy-theme"

export const Theme = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const dropdown = useSelector(dropdownStyleSelector)
  const mode = useSelector(modeSelector)
  const maxLen = ThemeModeList.map((i) => i18n[i].length).reduce(
    (a, b) => Math.max(a, b),
    0,
  )
  const items = ThemeModeList.map((i): DropdownItem => {
    const prefix = mode === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline
    const text = `${prefix} ${i18n[i].padEnd(maxLen, " ")}`
    return {
      key: i,
      label: text,
      onSelect: () => {
        dispatch.context.setMode(i)
      },
      style: {
        ...dropdown.item,
        justifyContent: "space-between",
        alignItems: "center",
      },
    }
  })
  return (
    <Dropdown
      id="mpv-easy-button-theme"
      // text={mode === 'dark' ? ICON.Sun : ICON.Moon}
      text={ICON.ThemeLightDark}
      title={i18n.theme}
      items={items}
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
      pageDown={{ style: dropdown.item, text: ICON.TriangleDown }}
      pageUp={{ style: dropdown.item, text: ICON.TriangleUp }}
    />
  )
}
