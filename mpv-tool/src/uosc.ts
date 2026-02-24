import { registerScriptMessage } from "./mpv"

const UOSC_VERSION: Promise<string | undefined> = new Promise((r) => {
  registerScriptMessage("uosc-version", (v) => {
    r(v)
  })
})

export function uoscVersion() {
  return UOSC_VERSION
}
