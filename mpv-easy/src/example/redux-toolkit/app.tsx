import React, { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "./store"
import { Counter } from "./counter"
import { render } from "@mpv-easy/ui"

const counterIds = ["1", "2"]
function CounterList() {
  return counterIds.map((counterId) => (
    <Counter key={counterId} counterId={counterId} />
  ))
}

// TODO: need more polyfills
export function App() {
  return (
    <Provider store={store}>
      <CounterList />
    </Provider>
  )
}

render(<App />)
