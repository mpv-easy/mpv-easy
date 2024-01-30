import { createModel } from "@rematch/core"
import type { RootModel } from "."
import { ThemeMode } from "./theme"
export const ThemeName = {
  osc: "osc",
  youtube: "youtube",
  bilibili: "bilibili",
  uosc: "uosc",
  potplayer: "potplayer",
} as const

export type ThemeName = keyof typeof ThemeName

export type CounterState = {
  count: number
}
const state: CounterState = {
  count: 1,
}

export const counter = createModel<RootModel>()({
  state,
  reducers: {
    setCount: (state, count: number) => ({
      count,
    }),
    change: (state, n: number) => {
      const c = state.count + n
      return { count: c }
    },
  },
  // selectors: (slice, createSelector) => ({
  //   double() {
  //     return slice((counter) => counter.count * 2)
  //   },
  // }),
})
