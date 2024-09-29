import { runCmdSync } from "./ext"

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

export function getLang(): Lang {
  return runCmdSync("(Get-Culture).Name").stdout.trim() as Lang
}
