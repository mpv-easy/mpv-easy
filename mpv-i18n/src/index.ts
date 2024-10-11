import { osdMessage } from "@mpv-easy/tool"
import { useState } from "react"
import cn from "./i18n/cn"
import en from "./i18n/en"
import { definePlugin } from "@mpv-easy/plugin"
const resources = { en, cn }

export const pluginName = "@mpv-easy/i18n"

export const LanguageList = ["cn", "en"] as const
export type LanguageName = (typeof LanguageList)[number]

export type I18nConfig = {
  default: LanguageName
  lang: { en: typeof en; cn: typeof cn }
}

export const defaultConfig: I18nConfig = {
  default: "en",
  lang: { en, cn },
}
declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: I18nConfig
  }
}

const defaultLang = "en"
export type Language = keyof typeof resources
export type LanguageKey = keyof typeof en

export function useTranslation() {
  const [lang, changeLanguage] = useState<Language>("en")
  const t = (name: LanguageKey) => {
    const r = resources[lang]
    if (name in r) {
      return r[name]
    }
    const fallback = resources[defaultLang][name]
    if (fallback) {
      const err = `i18n name: '${name}' not found, use fallback lang: ${defaultLang}, ${name}=>${fallback}`
      osdMessage(err, 2000)
      return fallback
    }

    const err = `i18n name not exits: '${name}', using an empty string instead."`
    osdMessage(err, 2000)
    return ""
  }
  return { t, changeLanguage }
}

export default definePlugin(() => ({
  name: pluginName,
}))
