import { Box, render } from "@mpv-easy/react"
import * as ICON from "../icon"
import React, { useEffect } from "react"
import { Provider } from "react-redux"

import { useDispatch, useSelector } from "react-redux"

import { createStore } from "redux"

// Actions
const INCREMENT = "INCREMENT"
const DECREMENT = "DECREMENT"

interface IncrementAction {
  type: typeof INCREMENT
}

interface DecrementAction {
  type: typeof DECREMENT
}

type CounterActionTypes = IncrementAction | DecrementAction

type State = {
  count: number
}

const counterReducer = (
  state: State | undefined,
  action: CounterActionTypes,
): State => {
  if (!state) {
    return { count: 1 }
  }
  switch (action.type) {
    case INCREMENT:
      return { count: state.count + 1 }
    case DECREMENT:
      return { count: state.count - 1 }
    default:
      return state
  }
}
const store = createStore(counterReducer)

function Counter() {
  const count = useSelector((state: State) => state.count)
  const dispatch = useDispatch()
  console.log("============count: ", count)
  useEffect(() => {
    setInterval(() => {
      dispatch({ type: "INCREMENT" })
    }, 1000)
  }, [])

  return (
    <Box font="FiraCode Nerd Font Mono" fontSize={128} id="box_0">
      <Box
        id="box_1"
        text={ICON.Minus}
        onMouseDown={() => {
          console.log("minus: ", count)
          dispatch({ type: "DECREMENT" })
        }}
      />
      <Box id="box_2" text={count.toString()} backgroundColor={"#FF00FF"} />
      <Box
        id="box_3"
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
  <Provider store={store}>
    <Counter />
  </Provider>,
)
