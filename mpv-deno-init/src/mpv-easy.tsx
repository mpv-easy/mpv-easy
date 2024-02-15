import { createStore, getConfig, Easy } from "@mpv-easy/mpv-easy"
import React from "react"
import { Provider } from "react-redux"
import { customRender } from "./customRender"

const store = createStore()
const config = getConfig()
store.getState().context = config
export const renderMpvEasy = () => {
  customRender(
    <Provider store={store}>
      <Easy fontSize={24} initHide={false} skipFirstRender={false} />
    </Provider>,
  )
}
