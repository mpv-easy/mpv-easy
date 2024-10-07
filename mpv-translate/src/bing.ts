import {
  existsSync,
  getTmpDir,
  normalize,
  readFile,
  writeFile,
} from "@mpv-easy/tool"
import { fetch } from "@mpv-easy/tool"
import { md5 } from "js-md5"

export async function bingClientSearch(word: string): Promise<string> {
  const q = encodeURIComponent(word)
  const url = `https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q=${q}`
  const tmpDir = getTmpDir()
  const hash = md5.create().update(url).hex()
  const cachePath = normalize(`${tmpDir}/${hash}.${q}.txt`)
  if (existsSync(cachePath)) {
    return readFile(cachePath)
  }
  const text = await fetch(url).then((r) => r.text())
  writeFile(cachePath, text)
  return text
}
