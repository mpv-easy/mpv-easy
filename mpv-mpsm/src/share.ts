export async function downloadText(url: string): Promise<string> {
  return await fetch(url).then((resp) => resp.text())
}

export async function downloadJson<T>(url: string): Promise<T> {
  return (await fetch(url).then((resp) => resp.json())) as T
}

export function getFileNameFromUrl(url: string): string {
  return url.split("/").at(-1)!
}
