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
          // TODO: add dropdown align items prop
          label: oscPrefix + "  " + i18n.osc,
          onSelect: () => {
            dispatch.context.setUI("osc")
          },
        },
        {
          key: "uosc",
          label: uoscPrefix + " " + i18n.uosc,
          onSelect: () => {
            dispatch.context.setUI("uosc")
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
