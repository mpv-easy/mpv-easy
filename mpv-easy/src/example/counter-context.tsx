import React, {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
} from "react"
import * as ICON from "../icon"

interface CounterState {
  count: number
}

type Action = { type: "INCREMENT" } | { type: "DECREMENT" }

interface CounterContextProps {
  state: CounterState
  dispatch: Dispatch<Action>
}

const CounterContext = createContext<CounterContextProps | undefined>(undefined)

const counterReducer = (state: CounterState, action: Action): CounterState => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 }
    case "DECREMENT":
      return { count: state.count - 1 }
    default:
      return state
  }
}

const CounterProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 })

  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  )
}

const useCounter = () => {
  const context = useContext(CounterContext)
  if (!context) {
    throw new Error("useCounter must be used within a CounterProvider")
  }
  return context
}
import { Box, Button, render } from "@mpv-easy/ui"

function Counter() {
  const {
    state: { count },
    dispatch,
  } = useCounter()

  console.log("============count: ", count)
  return (
    <Box
      font="FiraCode Nerd Font Mono Reg"
      fontSize={128}
      flexDirection="column"
      justifyContent="end"
    >
      <Button
        text={ICON.Minus}
        onMouseDown={() => {
          console.log("minus: ", count)
          dispatch({ type: "DECREMENT" })
        }}
        backgroundColor={"00FFFF"}
        backgroundColorHover={"FF0000"}
      />
      <Box text={count.toString()} backgroundColor={"FF00FF"} />
      <Button
        backgroundColor={"FFFF00"}
        backgroundColorHover={"0FFFF0"}
        onMouseDown={() => {
          console.log("plus: ", count)
          dispatch({ type: "INCREMENT" })
        }}
        text={ICON.Plus}
      />
    </Box>
  )
}

render(
  <CounterProvider>
    <Counter />
  </CounterProvider>,
)
