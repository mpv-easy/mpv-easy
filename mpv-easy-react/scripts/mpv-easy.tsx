import "@mpv-easy/polyfill"
import { uoscVersion } from "@mpv-easy/tool"

console.log(
  "uoscVersion",
  uoscVersion().then((i) => {
    console.log("iiii---", i)
  }),
)

async function r() {
  console.log("v---1", await uoscVersion())
  console.log("v---2", await uoscVersion())
}

r()
