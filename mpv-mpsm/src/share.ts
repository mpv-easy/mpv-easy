export async function downloadText(url: string): Promise<string> {
  return await fetch(url).then((resp) => resp.text())
}

export async function downloadJson<T>(url: string): Promise<T> {
  return (await fetch(url).then((resp) => resp.json())) as T
}

export function getFileNameFromUrl(url: string): string {
  return url.split("/").at(-1)!
}

export function isScript(url: string) {
  return url.endsWith(".meta.js") || url.endsWith(".meta.lua")
}

export function getLang(url: string) {
  return url.split(".").at(-1)
}
