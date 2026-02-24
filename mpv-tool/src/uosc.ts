import { registerScriptMessage } from "./mpv"
let UOSC_VERSION: string | undefined
const UOSC_VERSION_P: Promise<string | undefined> = new Promise((r) => {
  if (mp) {
    registerScriptMessage("uosc-version", (v) => {
      r(v)
    })

    setTimeout(() => {
      r(UOSC_VERSION)
    }, 100)
  }
})

export function uoscVersion() {
  if (UOSC_VERSION) {
    return UOSC_VERSION
  }
  return UOSC_VERSION_P
}
