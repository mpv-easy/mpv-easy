import { printAndOsd, fetch, cacheAsync } from "@mpv-easy/tool"

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
  const text = await cacheAsync(url, () =>
    fetch(url, { redirect: "follow" }).then((r) => r.text()),
  )
  return text
}
