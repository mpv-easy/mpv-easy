import { Models } from "@rematch/core"
import { theme } from "./theme"
import { counter } from "./counter"

export interface RootModel extends Models<RootModel> {
  theme: typeof theme
  counter: typeof counter
}
export const models: RootModel = { theme, counter }

// import { RematchDispatch, RematchRootState, init } from "@rematch/core"
// export const store = init({
//   models,
// })
// export type Store = typeof store
// export type Dispatch = RematchDispatch<RootModel>
// export type RootState = RematchRootState<RootModel>
