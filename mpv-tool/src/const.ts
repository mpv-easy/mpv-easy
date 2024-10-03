export const PunctuationKeys = [
  "!",
  "@",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "-",
  "_",
  "=",
  "+",
  "[",
  "]",
  "{",
  "}",
  "\\",
  "|",
  ";",
  ":",
  '"',
  ",",
  ".",
  "<",
  ">",
  "/",
  "?",
  "`",
  "~",
] as const
export const CtrlKeys = ["ESC", "ENTER", "BS", "SPACE"] as const
export const NumberKeys = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
] as const
export const AlphabetKeys = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const

export type NumberKey = (typeof NumberKeys)[number]
export type CtrlKey = (typeof CtrlKeys)[number]
export type PunctuationKey = (typeof PunctuationKeys)[number]
export type AlphabetKey = (typeof AlphabetKeys)[number]
export type InputKey = NumberKey | CtrlKey | PunctuationKey | AlphabetKey
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
