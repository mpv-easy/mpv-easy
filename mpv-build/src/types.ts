import type { Script } from "@mpv-easy/mpsm"
import type { Repo } from "@mpv-easy/tool"
import type { PLATFORM_LIST, UI_LIST } from "./constants"

export type Platform = (typeof PLATFORM_LIST)[number]
export type UI = (typeof UI_LIST)[number]["name"]

export interface DataType extends Script {
  key: string
  repo?: Repo
}

export type State = {
  [K in keyof Store as Store[K] extends Function ? never : K]: Store[K]
}

export interface Store {
  data: Record<string, DataType>
  tableData: DataType[]
  spinning: boolean
  selectedRowKeys: string[]
  externalList: string[]
  ui: UI
  platform: Platform
  repos: Repo[]
  setData: (data: Record<string, DataType>) => void
  setTableData: (tableData: DataType[]) => void
  setSpinning: (spinning: boolean) => void
  setSelectedKeys: (selectedRowKeys: string[]) => void
  setExternalList: (externalList: string[]) => void
  setUI: (ui: UI) => void
  setPlatform: (platform: Platform) => void
  setState: (state: State) => void
  setRepos: (repos: Repo[]) => void
}
