import { createModel } from "@rematch/core"
import type { RootModel } from "."
export const ThemeName = {
  osc: "osc",
  youtube: "youtube",
  bilibili: "bilibili",
  uosc: "uosc",
  potplayer: "potplayer",
} as const

export type ThemeName = keyof typeof ThemeName

export type ThemeState = {
  mode: ThemeMode
  name: ThemeName
  color: string
  backgroundColor: string
  padding: number
}

export type ThemeMode = "dark" | "light"

const defaultCOlor = "FFFFFFA0"
const defaultBackgroundColor = "FFFFFFA0"
const defaultPadding = 16
const state: ThemeState = {
  mode: "dark",
  name: "uosc",
  color: defaultCOlor,
  backgroundColor: defaultBackgroundColor,
  padding: defaultPadding,
}

export const theme = createModel<RootModel>()({
  state,
  reducers: {
    setMode: (state, mode: ThemeMode) => ({
      ...state,
      mode,
      color: mode === "dark" ? defaultCOlor : defaultBackgroundColor,
      backgroundColor: mode === "dark" ? defaultBackgroundColor : defaultCOlor,
    }),
  },
  // selectors: (slice, createSelector) => ({
  //   modeNumber() {
  //     return slice((theme) => "")
  //   },
  // }),
})
