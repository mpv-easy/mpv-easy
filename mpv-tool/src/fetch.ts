import { execAsync, execSync } from "./common"
import { FetchMethod, FetchOption, FetchResponse } from "./const"
import { detectCmd } from "./ext"
import { existsSync } from "./fs"
import { fetchByExt, getRsExtExePath } from "./rs-ext"

function generateMethod(options: FetchOption): string[] {
  const method = options.method
  if (!method) return ["-X", "GET"]
  return [
    "-X",
    FetchMethod[method.toUpperCase() as keyof typeof FetchMethod] ||
      method.toUpperCase(),
  ]
}

const getHeaderString = (name: string, val: string) =>
  `${name}: ${`${val}`.replace(/(\\|")/g, "\\$1")}`

function generateHeader(options: FetchOption = {}): {
  params: string[]
  isEncode: boolean
} {
  const { headers = {} } = options
  let isEncode = false
  const headerParam: string[] = ["-s"]

  if (options.redirect === "follow") {
    headerParam.push("-L")
  }

  Object.keys(headers).forEach((name) => {
    if (name.toLocaleLowerCase() !== "content-length") {
      headerParam.push("-H")
      headerParam.push(getHeaderString(name, headers[name]))
    }
    if (name.toLocaleLowerCase() === "accept-encoding") {
      isEncode = true
    }
  })
  return {
    params: headerParam,
    isEncode,
  }
}

function escapeBody(body: Object): string {
  if (typeof body !== "string") return JSON.stringify(body)
  return body.replace(/'/g, `'\\''`)
}

function generateBody(body: Object): string[] {
  if (!body) return []

  const s =
    typeof body === "object"
      ? escapeBody(JSON.stringify(body))
      : escapeBody(body)
  return ["--data-binary", `${s}`]
}

function generateCompress(isEncode: boolean): string {
  return isEncode ? " --compressed" : ""
}

const fetchToCurl = (url: string, options: FetchOption = {}): string[] => {
  const { body = "" } = options
  const headers = generateHeader(options)
  return [
    "curl",
    "-k", // disable SSL
    `${url}`,
    ...generateMethod(options),
    ...headers.params,
    ...generateBody(body),
    generateCompress(headers.isEncode),
  ].filter((i) => !!i.length)
}

export function fetchByCurlSync(url: string, options: FetchOption = {}) {
  const cmd = fetchToCurl(url, options)
  const s = decodeURIComponent(execSync(cmd))
  return s
}

export async function fetchByCurl(url: string, options: FetchOption = {}) {
  const cmd = fetchToCurl(url, options)
  const text = await execAsync(cmd)
  const status = 200
  return {
    status,
    ok: status === 200,
    text: () => Promise.resolve(text),
    json: () => Promise.resolve(JSON.parse(text)),
  }
}

export async function fetch(
  url: string,
  options: FetchOption = {},
): Promise<FetchResponse> {
  if (detectCmd("curl")) {
    return fetchByCurl(url, options)
  }

  if (existsSync(getRsExtExePath())) {
    return fetchByExt(url, options)
  }

  if (typeof globalThis.fetch === "function") {
    return options ? globalThis.fetch(url, options) : globalThis.fetch(url)
  }

  throw new Error("fetch command not found")
}
