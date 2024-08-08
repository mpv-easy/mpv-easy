import "./polyfill"
import React from "react"
import { renderToBrowser } from "./renderToBrowser"
import { Easy, createStore, getConfig } from "@mpv-easy/easy-react"
import { Provider } from "react-redux"

setTimeout(() => {
  const store = createStore()
  const config = getConfig()
  store.getState().context = config
  renderToBrowser(
    <Provider store={store}>
      <Easy fontSize={24} initHide={false} />
    </Provider>,
    "JetBrainsMono NFM Regular",
  )
  console.log("render: ", store)
}, 1000)
