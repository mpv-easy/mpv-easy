import type { DropdownItem } from "@mpv-easy/react"
import React from "react"
import { Dropdown } from "@mpv-easy/react"
import * as ICON from "../../icon"
import {
  i18nSelector,
  uiNameSelector,
  smallFontSizeSelector,
  commonDropdownStyleSelector,
  commonDropdownItemStyleSelector,
} from "../../store"
import { UINameList } from "../../mpv-easy-theme"
import { getMaxStringLength } from "../../common"
import { dispatch, useSelector } from "../../models"
export const UI = () => {
  const i18n = useSelector(i18nSelector)
  const itemStyle = useSelector(commonDropdownItemStyleSelector)
  const uiName = useSelector(uiNameSelector)
  const maxLen = getMaxStringLength(UINameList)
  const _smallFontSize = useSelector(smallFontSizeSelector)
  const style = useSelector(commonDropdownStyleSelector)

  const items = UINameList.map((i): DropdownItem => {
    const prefix = uiName === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline
    return {
      key: i,
      label: `${prefix} ${i18n[i].padEnd(maxLen, " ")}`,
      onSelect: () => {
        dispatch.setUI(i)
      },
      style: itemStyle,
    }
  })

  return (
    <Dropdown
      {...style}
      id="mpv-easy-button-ui"
      direction="bottom"
      title={i18n.ui}
      items={items}
      text={ICON.PaletteColor}
    />
  )
}
