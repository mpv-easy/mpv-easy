import { create } from "zustand"
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware"
import type { Store } from "./types"
import { DEFAULT_STATE } from "./constants"

const hashStorage: StateStorage = {
  getItem: (key): string => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    const storedValue = searchParams.get(key) ?? ""
    return JSON.parse(storedValue)
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.set(key, JSON.stringify(newValue))
    location.hash = searchParams.toString()
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.delete(key)
    location.hash = searchParams.toString()
  },
}

export const useMpvStore = create<Store>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      setData: (data) => set({ ...get(), data }),
      setTableData: (tableData) => set({ ...get(), tableData }),
      setSpinning: (spinning) => set({ ...get(), spinning }),
      setSelectedKeys: (selectedRowKeys) => set({ ...get(), selectedRowKeys }),
      setExternalList: (externalList) => set({ ...get(), externalList }),
      setUI: (ui) => set({ ...get(), ui }),
      setPlatform: (platform) => set({ ...get(), platform }),
      setState: (state) => {
        set({ ...get(), ...state })
      },
      setRepos: (repos) => set({ ...get(), repos }),
    }),
    {
      name: "mpv-build",
      storage: createJSONStorage(() => hashStorage),
      version: undefined,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["data", "tableData", "spinning"].includes(key),
          ),
        ),
    },
  ),
)
