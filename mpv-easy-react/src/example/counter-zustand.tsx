import React from "react"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { Box } from "@mpv-easy/react"

interface CounterState {
  count: number
  time: number
  increase: () => void
}

export const useStore = create<CounterState>()(
  persist(
    (set, get) => ({
      count: 0,
      time: 0,
      increase: () => set({ count: get().count + 1, time: Date.now() }),
    }),
    {
      name: "food-storage",
      storage: createJSONStorage(() => ({
        setItem(name: string, v: string) {
          console.log("setItem,v", name, v)
        },
        getItem(name: string): string {
          console.log("getItem", name)
          return ""
        },
        removeItem(name: string) {
          console.log("getItem", name)
        },
      })),
      partialize: (state) => ({ count: state.count }),
    },
  ),
)

const doubleSelector = (state: CounterState) => state.count * 2

function App() {
  const { count, increase } = useStore()
  const double = useStore(doubleSelector)
  return (
    <Box
      id="zustand"
      width={"100%"}
      height={"100%"}
      justifyContent="center"
      alignItems="center"
      display="flex"
      flexDirection="column"
    >
      <Box id="zustand-count" text={`count:${count}`} />
      <Box id="zustand-double" text={`double:${double}`} />
      <Box id="zustand-increase" onClick={increase} text="inc" />
    </Box>
  )
}

export default App
