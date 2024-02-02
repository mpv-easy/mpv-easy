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
} from "../../store"

export const UI = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)

  const dropdown = useSelector(dropdownStyleSelector)
  return (
    <Dropdown
      id="mpv-easy-button-ui"
      direction="bottom"
      title={i18n.ui}
      items={[
        {
          key: "osc",
          label: i18n.osc,
          onSelect: () => {
            dispatch.context.setUI("osc")
          },
        },
        {
          key: "uosc",
          label: i18n.uosc,
          onSelect: () => {
            dispatch.context.setUI("uosc")
          },
        },
      ]}
      text={i18n.skin}
      height={button.height}
      // TODO: dropdown should auto fit width
      width={button.width * 2}
      display="flex"
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
