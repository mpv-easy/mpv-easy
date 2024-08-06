import type { Models } from "@rematch/core"
import { context } from "./context"

export interface RootModel extends Models<RootModel> {
  context: typeof context
}

export const models: RootModel = { context }
