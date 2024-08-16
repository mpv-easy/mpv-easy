import React, {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
} from "react"

export type StoreState = {
  count: number
  color: string
  backgroundColor: string
  progressBackgroundColor: string
  controlButtonPadding: number
  controlButtonFontSize: number
}

export const defaultState: StoreState = {
  count: 0,
  color: "#FF0000",
  backgroundColor: "#00FF00",
  progressBackgroundColor: "#0000FF",
  controlButtonPadding: 16,
  controlButtonFontSize: 32,
}
type Action =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "LIGHT_MODE" }
  | { type: "DARK_MODE" }

interface StoreContextProps {
  state: StoreState
  dispatch: Dispatch<Action>
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined)

const storeReducer = (state: StoreState, action: Action): StoreState => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 }
    case "DECREMENT":
      return { ...state, count: state.count - 1 }
    case "LIGHT_MODE":
      return {
        ...state,
        color: "#00FF00",
        backgroundColor: "#0000FF",
        progressBackgroundColor: "#00FFFF",
      }
    case "DARK_MODE":
      return {
        ...state,
        color: "#FF0000",
        backgroundColor: "#00FF00",
        progressBackgroundColor: "#0000FF",
      }
    default:
      throw new Error("dispatch action type not found")
  }
}

const StoreProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(storeReducer, defaultState)

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}

export { StoreProvider, useStore }
