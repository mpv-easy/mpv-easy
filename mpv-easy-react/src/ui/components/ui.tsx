import { Dropdown, DropdownItem } from "@mpv-easy/react"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import * as ICON from "../../icon"
import {
  buttonStyleSelector,
  type Dispatch,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  uiNameSelector,
} from "../../store"
import { UINameList } from "../../mpv-easy-theme"
import { getMaxStringLength } from "../../common"
export const UI = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const dropdown = useSelector(dropdownStyleSelector)
  const uiName = useSelector(uiNameSelector)
  const maxLen = getMaxStringLength(UINameList)

  const items = UINameList.map((i): DropdownItem => {
    const prefix = uiName === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline
    return {
      key: i,
      label: `${prefix} ${i18n[i].padEnd(maxLen, " ")}`,
      onSelect: () => {
        dispatch.context.setUI(i)
      },
      style: {
        ...dropdown.item,
        justifyContent: "space-between",
      },
    }
  })

  return (
    <Dropdown
      id="mpv-easy-button-ui"
      direction="bottom"
      title={i18n.skin}
      items={items}
      text={ICON.PaletteColor}
      height={button.height}
      width={button.width}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      enableMouseStyle={mouseHoverStyle}
      dropdownStyle={dropdown.button}
      padding={dropdown.button.padding}
      colorHover={dropdown.button.colorHover}
      backgroundColorHover={dropdown.button.backgroundColorHover}
      backgroundColor={dropdown.button.backgroundColor}
      font={dropdown.button.font}
      fontSize={button.fontSize}
      color={dropdown.button.color}
      dropdownListStyle={dropdown.list}
      onMouseDown={() => {
        // e.stopPropagation()
      }}
      pageDown={{ style: dropdown.item, text: ICON.TriangleDown }}
      pageUp={{ style: dropdown.item, text: ICON.TriangleUp }}
    />
  )
}
