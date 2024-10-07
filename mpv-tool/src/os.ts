import { execSync } from "./common"

export const LangList = [
  "en-US",
  "en-GB",
  "zh-CN",
  "zh-TW",
  "ja-JP",
  "ko-KR",
  "fr-FR",
  "de-DE",
  "es-ES",
  "it-IT",
  "ru-RU",
  "pt-BR",
  "ar-SA",
  "hi-IN",
  "tr-TR",
  "nl-NL",
  "pl-PL",
  "sv-SE",
  "fi-FI",
  "da-DK",
  "no-NO",
  "hu-HU",
  "cs-CZ",
  "el-GR",
  "he-IL",
  "th-TH",
  "vi-VN",
  "id-ID",
  "ms-MY",
  "fil-PH",
] as const

export type Lang = (typeof LangList)[number]

let _lang: Lang
export function getLang(): Lang {
  if (_lang) return _lang
  return (_lang = execSync([
    "powershell",
    "-c",
    "(Get-Culture).Name",
  ]).trim() as Lang)
}
