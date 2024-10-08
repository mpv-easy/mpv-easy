import { cacheAsync } from "@mpv-easy/tool"
import { fetch } from "@mpv-easy/tool"

export async function bingClientSearch(word: string): Promise<string> {
  const q = encodeURIComponent(word)
  const url = `https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q=${q}`
  const text = await cacheAsync(url, () => fetch(url).then((r) => r.text()))
  return text
}
