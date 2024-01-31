import React, {} from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import { store } from "./store"
import { Box, render } from "@mpv-easy/ui"
import { RootState, Dispatch } from "./store"

function CounterText({ c }: { c: number }) {
  console.log("CounterText")
  return <Box text={c.toString()}></Box>
}

function CounterA() {
  console.log("CounterA")
  const counterA = useSelector(
    (state: RootState) => state.counter["@countA/counter"],
  )
  const dispatch = useDispatch<Dispatch>()
  return (
    <>
      <Box
        display="flex"
        fontSize={128}
        color="FFFFFF"
        backgroundColor="000000A0"
      >
        <Box
          text="-"
          onClick={() => {
            console.log("-")
            dispatch.counter.changeA(-1)
          }}
        ></Box>
        <CounterText c={counterA}></CounterText>
        <Box
          text="+"
          onClick={() => {
            console.log("+")
            dispatch.counter.changeA(1)
          }}
        ></Box>
      </Box>
    </>
  )
}

function CounterB() {
  const counterB = useSelector((state: RootState) => state.counter.countB)
  const dispatch = useDispatch<Dispatch>()
  console.log("CounterB")
  return (
    <>
      <Box
        display="flex"
        fontSize={128}
        color="FFFFFF"
        backgroundColor="000000A0"
      >
        <Box
          text="-"
          onClick={() => {
            console.log("-")
            dispatch.counter.changeB(-1)
          }}
        ></Box>
        <CounterText c={counterB}></CounterText>
        {/* <Box text={counter.count.toString()}></Box> */}
        <Box
          text="+"
          onClick={() => {
            console.log("+")
            dispatch.counter.changeB(1)
          }}
        ></Box>
      </Box>
    </>
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
