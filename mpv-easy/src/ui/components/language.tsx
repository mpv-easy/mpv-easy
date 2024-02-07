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
  languageSelector,
} from "../../store"

export const Language = () => {
  const button = useSelector(buttonStyleSelector)
  const i18n = useSelector(i18nSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)

  const dropdown = useSelector(dropdownStyleSelector)
  const language = useSelector(languageSelector)
  const cnPrefix = language === "cn" ? ICON.Ok : ICON.CheckboxBlankCircleOutline
  const enPrefix = language === "en" ? ICON.Ok : ICON.CheckboxBlankCircleOutline

  return (
    <Dropdown
      // TODO: language switch icon
      text={language === "cn" ? "中" : "A"}
      id="mpv-easy-button-language"
      title={i18n.language}
      direction="bottom"
      items={[
        {
          key: "Chinese",
          label: cnPrefix + " " + i18n.languageChinese,
          onSelect: () => {
            dispatch.context.setLanguage("cn")
          },
        },
        {
          key: "English",
          label: enPrefix + " " + i18n.languageEnglish,
          onSelect: () => {
            dispatch.context.setLanguage("en")
          },
        },
      ]}
      height={button.height}
      // TODO: dropdown should auto fit width
      // width={button.width * 2}
      width={button.width}
      display="flex"
      flexDirection="column"
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
