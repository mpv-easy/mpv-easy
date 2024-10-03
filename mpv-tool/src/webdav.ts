import { fetch } from "./fetch"
export type WebdavItem = {
  href: string
  contentLength: number
  lastModified: string
}
export async function webdavList(
  url: string,
  depth = 1,
): Promise<WebdavItem[]> {
  const body = `<?xml version="1.0" encoding="utf-8" ?>
            <D:propfind xmlns:D="DAV:">
                <D:allprop/>
            </D:propfind>
        `
    .trim()
    .replaceAll("\n", " ")

  const xmlString = await fetch(url, {
    method: "PROPFIND",
    headers: {
      depth: depth.toString(),
    },
    body,
  }).then((r) => r.text())

  const regex =
    /<D:href>(.*?)<\/D:href>[\s\S]*?<D:getcontentlength>(.*?)<\/D:getcontentlength>[\s\S]*?<D:getlastmodified>(.*?)<\/D:getlastmodified>/g

  let match
  const list: WebdavItem[] = []
  while ((match = regex.exec(xmlString)) !== null) {
    const href = match[1]
    const contentLength = +match[2]
    const lastModified = match[3]
    list.push({ href, contentLength, lastModified })
  }
  return list
}
