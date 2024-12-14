import { type DropdownItem } from "@mpv-easy/react"
import React from "react"
import { Dropdown } from "@mpv-easy/react"
import * as ICON from "../../icon"
import {
  i18nSelector,
  modeSelector,
  commonDropdownStyleSelector,
  commonDropdownItemStyleSelector,
} from "../../store"
import { ThemeModeList } from "../../mpv-easy-theme"
import { dispatch, useSelector } from "../../models"

export const Theme = () => {
  const i18n = useSelector(i18nSelector)
  const itemStyle = useSelector(commonDropdownItemStyleSelector)
  const mode = useSelector(modeSelector)
  const style = useSelector(commonDropdownStyleSelector)

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
        dispatch.setMode(i)
      },
      style: itemStyle,
    }
  })
  return (
    <Dropdown
      {...style}
      id="mpv-easy-button-theme"
      // text={mode === 'dark' ? ICON.Sun : ICON.Moon}
      text={ICON.ThemeLightDark}
      title={i18n.theme}
      items={items}
      direction="bottom"
    />
  )
}
