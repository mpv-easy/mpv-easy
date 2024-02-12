import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import {
  configureStore,
  TypedStartListening,
  TypedAddListener,
  ListenerEffectAPI,
} from "@reduxjs/toolkit"
import { counterSlice } from "./counter.slice"

const store = configureStore({
  reducer: {
    [counterSlice.name]: counterSlice.reducer,
  },
}) as any

export { store }

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
export type AppDispatch = typeof store.dispatch

export type AppListenerEffectAPI = ListenerEffectAPI<RootState, AppDispatch>

// @see https://redux-toolkit.js.org/api/createListenerMiddleware#typescript-usage
export type AppStartListening = TypedStartListening<RootState, AppDispatch>
export type AppAddListener = TypedAddListener<RootState, AppDispatch>

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// @ts-ignore
export const useAppDispatch = () => useDispatch<AppDispatch>() as any
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
