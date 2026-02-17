import { cacheAsync, fetch, getLang, LangList } from "@mpv-easy/tool"

const headers = {
  "sec-ch-ua":
    '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
  "x-browser-year": "2024",
  "x-browser-channel": "stable",
  "sec-ch-ua-arch": '"x86"',
  "sec-ch-ua-bitness": '"64"',
  "sec-ch-ua-form-factors": '"Desktop"',
  "x-browser-copyright": "Copyright 2024 Google LLC. All rights reserved.",
}

export async function googleDetect(text: string): Promise<string | undefined> {
  if (text.trim().length === 0) return undefined
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
    const resp = await fetch(url, {
      headers,
    }).then((r) => r.text())
    const data = JSON.parse(resp)
    return data[2]
  } catch (e) {
    console.log("detect error: ", e)
    return undefined
  }
}

export async function google(
  text: string,
  targetaLang: string,
  sourceLang?: string,
): Promise<string> {
  if (text.trim().length === 0) return ""
  let sl = sourceLang?.split("-")[0].toLowerCase()
  let tl = targetaLang.split("-")[0].toLowerCase()
  const prefixList = LangList.map((i) => i.split("-")[0])
  if (!tl || !prefixList.includes(tl)) {
    tl = getLang().split("-")[0].toLowerCase()
  }
  if (!sl || !prefixList.includes(sl)) {
    sl = "auto"
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
    const resp = await cacheAsync(url, () =>
      fetch(url, {
        headers,
      }).then((r) => r.text()),
    )
    const data = JSON.parse(resp)
    if (!data || !data[0]) return ""
    const cn = data[0].map((v: any) => v[0]).join("")
    return cn
  } catch (e) {
    console.log("translate error: ", e)
    return ""
  }
}
