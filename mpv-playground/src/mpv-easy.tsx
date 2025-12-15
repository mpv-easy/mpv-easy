import "./polyfill"
import React from "react"
import { renderToBrowser } from "./renderToBrowser"
import { Easy, store, getConfig } from "@mpv-easy/easy-react"

setTimeout(() => {
  const config = getConfig()
  store.setState(config)
  renderToBrowser(
    <Easy fontSize={24} initHide={false} />,
    "FiraCode Nerd Font Mono",
  )
  console.log("render: ", store)
}, 1000)
