import React from "react"
import { createRoot } from "react-dom/client"
import { App } from "@mpv-easy/play-with"

async function main() {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(<App />)
}

main()
