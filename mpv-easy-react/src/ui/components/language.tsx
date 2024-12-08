import { Dropdown, DropdownItem } from "@mpv-easy/react"
import React from "react"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  languageSelector,
} from "../../store"
import { LanguageList } from "@mpv-easy/i18n"
import { getMaxStringLength } from "../../common"
import { ThemeModeList } from "../../mpv-easy-theme"
import { dispatch, useSelector } from "../../models"

export const Language = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const dropdown = useSelector(dropdownStyleSelector)
  const language = useSelector(languageSelector)
  const maxLen = getMaxStringLength(ThemeModeList.map((i) => i18n[i]))
  const items = LanguageList.map((i): DropdownItem => {
    const prefix = language === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline
    return {
      key: i,
      label: `${prefix} ${i18n[i].padEnd(maxLen)}`,
      onSelect: () => {
        dispatch.setLanguage(i)
      },
      style: dropdown.item,
    }
  })
  return (
    <Dropdown
      // TODO: language switch icon
      text={language === "cn" ? "中" : "A"}
      id="mpv-easy-button-language"
      title={i18n.language}
      direction="bottom"
      items={items}
      height={button.height}
      width={button.width}
      display="flex"
      justifyContent="center"
      alignItems="center"
      dropdownStyle={dropdown.button}
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
