import React from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"

async function main() {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(<App />)
}

main()
