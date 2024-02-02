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

export const Language = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)

  const dropdown = useSelector(dropdownStyleSelector)
  return (
    <Dropdown
      // TODO: language switch icon
      text={"A/中"}
      id="mpv-easy-button-language"
      title={i18n.language}
      direction="bottom"
      items={[
        {
          key: "Chinese",
          label: i18n.languageChinese,
          onSelect: () => {
            dispatch.context.setLanguage("cn")
          },
        },
        {
          key: "English",
          label: i18n.languageEnglish,
          onSelect: () => {
            dispatch.context.setLanguage("en")
          },
        },
      ]}
      height={button.height}
      // TODO: dropdown should auto fit width
      width={button.width * 2}
      display="flex"
      justifyContent="center"
      alignItems="center"
      dropdownStyle={dropdown.button}
      enableMouseStyle={mouseHoverStyle}
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
