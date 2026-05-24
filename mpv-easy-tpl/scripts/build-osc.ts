import { decode, encode, Fmt, File } from "@easy-install/easy-archive"
import { name } from "../package.json"
import { readFile, writeFile } from "node:fs/promises"

const oscUrl =
  "https://raw.githubusercontent.com/ahaoboy/mpv-easy-cdn/main/mpv-v3-windows.tar.xz"
const fileName = name.split("/").at(-1)!
const scriptPath = `portable_config/scripts/${fileName}.js`
const es5Path = `./es5/${fileName}.js`
const outputPath = `./${fileName}-osc.zip`

async function main() {
  const response = await fetch(oscUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch OSC: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const files = decode(Fmt.TarXz, new Uint8Array(arrayBuffer))
  if (!files) {
    throw new Error("Failed to decode OSC archive")
  }

  const jsBuffer = new Uint8Array(await readFile(es5Path))
  files.push(new File(scriptPath, jsBuffer, null, false, null))

  const content = encode(Fmt.Zip, files)
  if (!content) {
    throw new Error("Failed to encode output archive")
  }

  await writeFile(outputPath, content)
  console.log(`${fileName}-osc.zip created`)
}

main().catch((error) => {
  console.error("build-osc failed:", error)
  process.exit(1)
})
