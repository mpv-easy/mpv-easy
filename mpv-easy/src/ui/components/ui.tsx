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
  uiNameSelector,
} from "../../store"

export const UI = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const dropdown = useSelector(dropdownStyleSelector)
  const uiName = useSelector(uiNameSelector)
  const oscPrefix = uiName === "osc" ? ICON.Ok : ICON.CheckboxBlankCircleOutline
  const uoscPrefix =
    uiName === "uosc" ? ICON.Ok : ICON.CheckboxBlankCircleOutline

  return (
    <Dropdown
      id="mpv-easy-button-ui"
      direction="bottom"
      title={i18n.skin}
      items={[
        {
          key: "osc",
          label: `${oscPrefix} ${i18n.osc}`,
          onSelect: () => {
            dispatch.context.setUI("osc")
          },
          style: {
            ...dropdown.item,
            justifyContent: "space-between",
          },
        },
        {
          key: "uosc",
          label: `${uoscPrefix} ${i18n.uosc}`,
          onSelect: () => {
            dispatch.context.setUI("uosc")
          },
          style: {
            ...dropdown.item,
            justifyContent: "space-between",
          },
        },
      ]}
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
    />
  )
}
