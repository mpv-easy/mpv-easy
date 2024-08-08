import "@mpv-easy/polyfill"
import "@mpv-easy/tool"
import { render } from "@mpv-easy/react"
export function renderToMpv(reactNode: React.ReactNode) {
  render(reactNode)
}
