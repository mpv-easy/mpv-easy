import React from "react"
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"
import { Box, render } from "@mpv-easy/react"

function createState() {
  return makeAutoObservable({
    count: 0,
    increase() {
      this.count += 1
    },
    reset() {
      this.count = 0
    },
  })
}

const state = createState()
type State = ReturnType<typeof createState>
const App = observer(({ state }: { state: State }) => (
  <Box onClick={() => state.increase()} text={state.count.toString()} />
))

render(<App state={state} />)

setInterval(() => {
  state.increase()
}, 1000)
