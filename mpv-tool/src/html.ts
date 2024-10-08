const EscapeMap: Record<string, string> = {
  "&quot;": '"',
  "&#34;": '"',

  "&apos;": "'",
  "&#39;": "'",

  "&amp;": "&",
  "&#38;": "&",

  "&gt;": ">",
  "&#62;": ">",

  "&lt;": "<",
  "&#60;": "<",
}

export function unescapeHtml(html: string): string {
  for (const k in EscapeMap) {
    html = html.replaceAll(k, EscapeMap[k])
  }
  return html
}
export function escapeHtml(html: string): string {
  for (const k in EscapeMap) {
    html = html.replaceAll(EscapeMap[k], k)
  }
  return html
}
