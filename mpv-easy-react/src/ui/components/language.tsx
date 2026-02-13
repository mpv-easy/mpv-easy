import { type DropdownItem } from "@mpv-easy/react"
import React from "react"
import { Dropdown } from "@mpv-easy/react"
import * as ICON from "../../icon"
import {
  i18nSelector,
  languageSelector,
  commonDropdownStyleSelector,
  commonDropdownItemStyleSelector,
} from "../../store"
import { LanguageList } from "@mpv-easy/i18n"
import { getMaxStringLength } from "../../common"
import { ThemeModeList } from "../../mpv-easy-theme"
import { dispatch, useSelector } from "../../models"
import { useTitle } from "../../hooks"

export const Language = () => {
  const i18n = useSelector(i18nSelector)
  const itemStyle = useSelector(commonDropdownItemStyleSelector)
  const language = useSelector(languageSelector)
  const maxLen = getMaxStringLength(ThemeModeList.map((i) => i18n[i]))
  const style = useSelector(commonDropdownStyleSelector)
  const items = LanguageList.map((i): DropdownItem => {
    const prefix = language === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline
    return {
      key: i,
      label: `${prefix} ${i18n[i].padEnd(maxLen)}`,
      onSelect: () => {
        dispatch.setLanguage(i)
      },
      style: itemStyle,
    }
  })
  return (
    <Dropdown
      {...style}
      // TODO: language switch icon
      text={language === "cn" ? "中" : "A"}
      id="mpv-easy-button-language"
      title={useTitle(i18n.language)}
      direction="bottom"
      items={items}
    />
  )
}
