import React from "react"
import { createRoot } from "react-dom/client"
// @ts-ignore
import "./index.css"
import App from "./App"
import { ConfigProvider, theme } from "antd"
const { defaultAlgorithm, darkAlgorithm } = theme
import "@ant-design/v5-patch-for-react-19"

const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{ algorithm: isDark ? darkAlgorithm : defaultAlgorithm }}
  >
    <App />
  </ConfigProvider>,
)
