import {
  existsSync,
  getTmpDir,
  normalize,
  printAndOsd,
  readFile,
  writeFile,
  fetch,
} from "@mpv-easy/tool"
import { md5 } from "js-md5"

const ponsCombos = [
  "enes",
  "enfr",
  "deen",
  "enpl",
  "ensl",
  "defr",
  "dees",
  "deru",
  "depl",
  "desl",
  "deit",
  "dept",
  "detr",
  "deel",
  "dela",
  "espl",
  "frpl",
  "itpl",
  "plru",
  "essl",
  "frsl",
  "itsl",
  "enit",
  "enpt",
  "enru",
  "espt",
  "esfr",
  "delb",
  "dezh",
  "enzh",
  "eszh",
  "frzh",
  "denl",
  "arde",
  "aren",
  "dade",
  "csde",
  "dehu",
  "deno",
  "desv",
  "dede",
  "dedx",
]

export async function pons(s: string, targetaLang: string, sourceLang: string) {
  const q = encodeURIComponent(s)
  const lang = sourceLang + targetaLang
  if (!ponsCombos.includes(lang)) {
    printAndOsd(`pons not support language combos: ${lang}`)
    return ""
  }
  const url = `http://en.pons.com/translate?q=${q}&l=${lang}&in=${sourceLang}`
  const tmpDir = getTmpDir()
  const hash = md5.create().update(url).hex()
  const cachePath = normalize(`${tmpDir}/${hash}.${q}.txt`)
  if (existsSync(cachePath)) {
    return readFile(cachePath)
  }
  const text = await fetch(url, { redirect: "follow" }).then((r) => r.text())
  writeFile(cachePath, text)
  return text
}
