import { execSync } from "./common"

const type = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
} as const
export type FetchOption = Partial<{
  method: FetchMethod
  headers: Record<string, string>
  url: string
  body: string | Object
}>

export type FetchMethod = keyof typeof type | string

function generateMethod(options: FetchOption): string[] {
  const method = options.method
  if (!method) return ["-X", "GET"]
  return [
    "-X",
    type[method.toUpperCase() as keyof typeof type] || method.toUpperCase(),
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
  const headerParam: string[] = []

  Object.keys(headers).map((name) => {
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

export function escapeBody(body: Object): string {
  if (typeof body !== "string") return JSON.stringify(body)
  return body.replace(/'/g, `'\\''`)
}

export function generateBody(body: Object): string[] {
  if (!body) return []

  const s =
    typeof body === "object"
      ? escapeBody(JSON.stringify(body))
      : escapeBody(body)
  return ["--data-binary", `${s}`]
}

export function generateCompress(isEncode: boolean): string {
  return isEncode ? " --compressed" : ""
}
const fetchToCurl = (url: string, options: FetchOption = {}): string[] => {
  const { body = "" } = options
  const headers = generateHeader(options)
  return [
    "curl",
    url,
    ...generateMethod(options),
    ...headers.params,
    ...generateBody(body),
    generateCompress(headers.isEncode),
  ].filter((i) => !!i.length)
}

export function fetch(url: string, options: FetchOption = {}) {
  const cmd = fetchToCurl(url, options)
  const s = decodeURIComponent(execSync(cmd))
  return s
}
