import { RematchDispatch, RematchRootState, init } from "@rematch/core"
import selectPlugin from "@rematch/select"
import { RootModel, models } from "./models"

export function createStore() {
  return init<RootModel>({
    models,
    // add selectPlugin to your store
    plugins: [selectPlugin()],
  })
}

export type Store = ReturnType<typeof createStore>
export type Dispatch = RematchDispatch<RootModel>
export type RootStore = RematchRootState<RootModel>
