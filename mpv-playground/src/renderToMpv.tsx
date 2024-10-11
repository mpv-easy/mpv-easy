import "@mpv-easy/polyfill"
import { render } from "@mpv-easy/react"

export function renderToMpv(reactNode: React.ReactNode) {
  render(reactNode)
}
