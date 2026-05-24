import { fetch } from "./fetch"
import { existsSync } from "./fs"
import { getFileName } from "./path"
import { getRsExtExePath } from "./rs-ext"
import { webdavListAsync as webdavListAsyncByExt } from "./rs-ext/webdav"
import { parseWebDav } from "webdav-parser"

export type WebdavItem = {
  href: string
  contentLength: number
  lastModified: string
}

export async function webdavList(
  url: string,
  auth?: string,
  depth = 1,
): Promise<string[]> {
  const exe = getRsExtExePath()
  if (existsSync(exe)) {
    return webdavListAsyncByExt(url, exe, exe)
  }
  const body = `<?xml version="1.0" encoding="utf-8" ?>
            <D:propfind xmlns:D="DAV:">
                <D:allprop/>
            </D:propfind>
        `
    .trim()
    .replaceAll("\n", " ")

  const headers: {
    depth: string
    Authorization?: string
  } = {
    depth: depth.toString(),
  }
  if (auth) {
    const encoded = Buffer.from(auth).toString("base64")
    headers.Authorization = `Basic ${encoded}`
  }
  const xmlString = await fetch(url, {
    method: "PROPFIND",
    headers,
    body,
  }).then((r) => r.text())

  const dav = parseWebDav(xmlString)

  const v = dav.responses
    .map((i) => decodeURIComponent(i.href))
    .filter((i) => !!getFileName(i)?.length)
  return v
}
