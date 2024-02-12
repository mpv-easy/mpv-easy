import "@mpv-easy/polyfill"
import "@mpv-easy/tool"
import { render } from "@mpv-easy/ui"
export function renderToMpv(reactNode: React.ReactNode) {
  render(reactNode)
}
