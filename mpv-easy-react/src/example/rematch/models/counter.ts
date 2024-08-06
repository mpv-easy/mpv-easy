import { createModel } from "@rematch/core"
import type { RootModel } from "."

export const counter = createModel<RootModel>()({
  state: {
    "@countA/counter": 0,
    countB: 0,
  },
  reducers: {
    changeA: (state, payload: number) => ({
      ...state,
      countA: state["@countA/counter"] + payload,
    }),
    changeB: (state, payload: number) => ({
      ...state,
      countB: state.countB + payload,
    }),
  },
  selectors: (slice) => ({
    doubleA() {
      return slice((counter) => counter["@countA/counter"] * 2)
    },
    doubleB() {
      return slice((counter) => counter.countB * 2)
    },
  }),
})
