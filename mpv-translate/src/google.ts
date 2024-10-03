import { fetch, Lang, LangList } from "@mpv-easy/tool"

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

export async function google(
  text: string,
  targetaLang: Lang,
  sourceLang?: Lang,
): Promise<string> {
  if (text.trim().length === 0) return ""
  const sl = sourceLang?.split("-")[0].toLowerCase()
  const tl = targetaLang.split("-")[0].toLowerCase()

  const url = LangList.map((i) => i.split("-")[0]).includes(tl)
    ? `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
    : `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`

  const resp = await fetch(url, {
    headers,
  }).then((r) => r.text())

  try {
    const cn = JSON.parse(resp)[0]
      .map((v: any) => v[0])
      .join("")
    return cn
  } catch (e) {
    console.log("translate error: ", e)
    return ""
  }
}