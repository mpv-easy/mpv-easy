import { fetch, Lang } from "@mpv-easy/tool"

export function google(
  text: string,
  targetaLang: Lang,
  sourceLang: Lang,
): string {
  if (text.trim().length === 0) return ""
  const sl = sourceLang.split("-")[0]
  const tl = targetaLang.split("-")[0]
  const resp = fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`,
  ).text
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
