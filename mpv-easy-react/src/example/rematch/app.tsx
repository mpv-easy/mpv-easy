import React from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import { store } from "./store"
import { Box, render } from "@mpv-easy/react"
import type { RootState, Dispatch } from "./store"
import { print } from "@mpv-easy/tool"

function CounterText({ c }: { c: number }) {
  print("CounterText")
  return <Box text={c.toString()} />
}

function CounterA() {
  print("CounterA")
  const counterA = useSelector(
    (state: RootState) => state.counter["@countA/counter"],
  )
  const dispatch = useDispatch<Dispatch>()
  return (
    <Box
      display="flex"
      fontSize={128}
      color="#FFFFFF"
      backgroundColor="#000000A0"
    >
      <Box
        text="-"
        onClick={() => {
          print("-")
          dispatch.counter.changeA(-1)
        }}
      />
      <CounterText c={counterA} />
      <Box
        text="+"
        onClick={() => {
          print("+")
          dispatch.counter.changeA(1)
        }}
      />
    </Box>
  )
}

function CounterB() {
  const counterB = useSelector((state: RootState) => state.counter.countB)
  const dispatch = useDispatch<Dispatch>()
  print("CounterB")
  return (
    <Box
      display="flex"
      fontSize={128}
      color="#FFFFFF"
      backgroundColor="#000000A0"
    >
      <Box
        text="-"
        onClick={() => {
          print("-")
          dispatch.counter.changeB(-1)
        }}
      />
      <CounterText c={counterB} />
      {/* <Box text={counter.count.toString()}></Box> */}
      <Box
        text="+"
        onClick={() => {
          print("+")
          dispatch.counter.changeB(1)
        }}
      />
    </Box>
  )
}
function App() {
  return (
    <>
      <CounterA />
      <CounterB />
    </>
  )
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
)
