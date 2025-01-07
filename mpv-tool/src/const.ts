export const ConfigDir = "mpv-easy-config"

export const EPSILON = 1e-10

export const DEFAULT_ASS_HEIGHT = 720

export const FetchMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
} as const

export type RequestRedirect = "error" | "follow" | "manual"
export type FetchOption = Partial<{
  method: FetchMethod
  headers: Record<string, string>
  url: string
  body: any
  redirect: RequestRedirect
}>

export type FetchMethod = keyof typeof FetchMethod | (string & {})

export type FetchResponse = {
  status: number
  ok: boolean
  text(): Promise<string>
  json(): Promise<any>
}
