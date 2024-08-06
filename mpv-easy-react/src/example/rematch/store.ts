import {
  type RematchDispatch,
  type RematchRootState,
  init,
} from "@rematch/core"
import selectPlugin from "@rematch/select"
import { type RootModel, models } from "./models"
export const store = init<RootModel>({
  models,
  // add selectPlugin to your store
  plugins: [selectPlugin()],
})
export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
