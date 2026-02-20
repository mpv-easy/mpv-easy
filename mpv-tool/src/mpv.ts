import { getOs } from "./common"
import { ConfigDir } from "./const"
import { getFileName, normalize } from "./path"
import { Argb } from "e-color"
import type {
  AddKeyBindingFlags,
  FileInfo,
  LogLevel,
  MpvType,
  OSDMargins,
  MpvOsdOverlay,
  OSDSize,
  StrToType,
  CommandResult,
  StringProp,
  BoolProp,
  NumberProp,
  NativeProp,
} from "./type"
import { expandPath } from "./type"
import { MousePos } from "./type-prop"
import { dirname, existsSync } from "./fs"

export function command(command: string): true | undefined {
  // console.log("command: ", command)
  return mp.command(command)
}

export function commandv(...args: (string | number)[]): true | undefined {
  // console.log("commandv: ", args)
  return mp.commandv(...args)
}

export function commandNative<T = CommandResult>(table: unknown): T {
  return mp.command_native<T>(table)
}

export function commandNativeAsync<T = CommandResult>(
  table: {
    name: string
    args?: string[]
    playback_only?: boolean
    capture_stdout?: boolean
    capture_stderr?: boolean
  },
  fn?: (success: boolean, result: T, error: string | undefined) => void,
): number {
  return mp.command_native_async<T>(table, fn)
}

export function abortAsyncCommand(t: number) {
  return mp.abort_async_command(t)
}

// export const getProperty = mp.get_property
export function getProperty(
  name: StringProp | (string & {}),
): string | undefined
export function getProperty(
  name: StringProp | (string & {}),
  def: string,
): string
export function getProperty(
  name: StringProp | (string & {}),
  def?: string,
): string | undefined {
  return mp.get_property(name) ?? def
}

// export const getPropertyOsd = mp.get_property_osd
export function getPropertyOsd(name: string): string | undefined
export function getPropertyOsd(name: string, def: string): string
export function getPropertyOsd(name: string, def?: string): string | undefined {
  return mp.get_property_osd(name, def)
}

// export const getPropertyBool = mp.get_property_bool
export function getPropertyBool(
  name: BoolProp | (string & {}),
): boolean | undefined
export function getPropertyBool(
  name: BoolProp | (string & {}),
  def: boolean,
): boolean
export function getPropertyBool(
  name: BoolProp | (string & {}),
  def?: boolean,
): boolean | undefined {
  return mp.get_property_bool(name) ?? def
}

// export const getPropertyString = mp.get_property_string
export function getPropertyString(
  name: StringProp | (string & {}),
): string | undefined
export function getPropertyString(
  name: StringProp | (string & {}),
  def: string,
): string
export function getPropertyString(
  name: StringProp | (string & {}),
  def?: string,
): string | undefined {
  return mp.get_property_native<string>(name) ?? def
}

// export const getPropertyNumber = mp.get_property_number
export function getPropertyNumber(
  name: NumberProp | (string & {}),
): number | undefined
export function getPropertyNumber(
  name: NumberProp | (string & {}),
  def: number,
): number
export function getPropertyNumber(
  name: NumberProp | (string & {}),
  def?: number,
): number | undefined {
  return mp.get_property_number(name) ?? def
}
export function getPropertyNative<
  K extends keyof NativeProp,
  T = NativeProp[K],
>(name: K): T | undefined
export function getPropertyNative<
  K extends keyof NativeProp,
  T = NativeProp[K],
>(name: K, def: NoInfer<T>): T
export function getPropertyNative<T>(name: string): T | undefined
export function getPropertyNative<T>(name: string, def: NoInfer<T>): T
export function getPropertyNative<
  K extends keyof NativeProp,
  T = NativeProp[K],
>(name: K, def?: NoInfer<T>): T | undefined {
  return mp.get_property_native(name) ?? def
}

export function setProperty(name: string, value: string): true | undefined {
  return mp.set_property(name, value)
}

export function setPropertyBool(
  name: BoolProp | (string & {}),
  value: boolean,
): true | undefined {
  return mp.set_property_bool(name, value)
}
export function setPropertyString(
  name: StringProp | (string & {}),
  value: string,
): true | undefined {
  return mp.set_property(name, value)
}

export function setPropertyNumber(
  name: NumberProp | (string & {}),
  value: number,
): true | undefined {
  return mp.set_property_number(name, value)
}

export function setPropertyNative(
  name: string,
  value: unknown,
): true | undefined {
  return mp.set_property_native(name, value)
}

export function getTime(): number {
  return mp.get_time()
}

export type KeyEvent = {
  canceled: boolean
  scale: number
  arg?: string
  key: string
  event: "up" | "down" | "press"
  is_mouse: boolean
  key_name?:
    | "WHEEL_DOWN"
    | "WHEEL_UP"
    | "MBTN_LEFT"
    | "MBTN_RIGHT"
    | "MBTN_MID"
    | (string & {})
}

export function addKeyBinding(
  key: string,
  name?: string,
  fn?: (event: KeyEvent) => void,
  flags?: AddKeyBindingFlags,
) {
  return mp.add_key_binding(key, name, fn, flags)
}

export function addForcedKeyBinding(
  key: string,
  name?: string,
  fn?: (event: KeyEvent) => void,
  flags?: AddKeyBindingFlags,
) {
  return mp.add_forced_key_binding(key, name, fn, flags)
}

export function removeKeyBinding(name: string) {
  return mp.remove_key_binding(name)
}

export function registerEvent(
  name: string,
  fn: (event: Record<string, unknown>) => void,
) {
  return mp.register_event(name, fn)
}

export function unregisterEvent(fn: (...args: unknown[]) => void) {
  return mp.unregister_event(fn)
}

export function observeProperty<
  K extends (string & {}) | keyof NativeProp,
  T extends keyof MpvType,
  P = K extends keyof NativeProp ? NativeProp[K] : StrToType<T>,
>(name: K, type: T, fn: (name: string, value: P) => void) {
  return mp.observe_property(name, type as any, fn as any)
}

export function observePropertyNumber(
  name: NumberProp | (string & {}),
  fn: (name: string, value: number) => void,
) {
  return observeProperty(name, "number", (name: string, v: number) =>
    fn(name, v),
  )
}

export function observePropertyBool(
  name: BoolProp | (string & {}),
  fn: (name: string, value: boolean) => void,
) {
  return observeProperty(name, "bool", (name: string, v: boolean) =>
    fn(name, v),
  )
}

export function observePropertyString(
  name: StringProp | (string & {}),
  fn: (name: string, value: string) => void,
) {
  return observeProperty(name, "string", (name: string, v: string) =>
    fn(name, v),
  )
}

export function unobserveProperty(fn: (...args: unknown[]) => void) {
  return mp.unobserve_property(fn)
}

export function getOpt(key: string): string {
  return mp.get_opt(key)
}

export function getScriptName(): string {
  return mp.get_script_name()
}

export function osdMessage(text: string, seconds?: number) {
  return mp.osd_message(text, seconds)
}

export function registerIdle(fn: () => void) {
  return mp.register_idle(fn)
}

export function unregisterIdle(fn: () => void) {
  return mp.unregister_idle(fn)
}

export function enableMessages(level: LogLevel) {
  return mp.enable_messages(level)
}

export function registerScriptMessage(
  name: string,
  fn: (...args: string[]) => void,
) {
  return mp.register_script_message(name, fn)
}

export function unregisterScriptMessage(name: string) {
  return mp.unregister_script_message(name)
}

export function createOsdOverlay(
  format: "ass-events" = "ass-events",
): MpvOsdOverlay {
  return mp.create_osd_overlay(format)
}

export function setOsdAss(res_x: number, res_y: number, data: string) {
  mp.set_osd_ass(res_x, res_y, data)
}

export function getOsdSize(): OSDSize | undefined {
  return mp.get_osd_size()
}

export function getOsdMargins(): OSDMargins | undefined {
  return mp.get_osd_margins()
}

export function addHook(name: string, priority: number, fn: () => void) {
  return mp.add_hook(name, priority, fn)
}

export function lastError(): string {
  return mp.last_error()
}

export function getTimeMs(): number {
  return mp.get_time_ms()
}

export function getScriptFile(): string {
  return mp.get_script_file()
}

let _scriptDirCache: string
export function getScriptDir(): string {
  if (_scriptDirCache) return _scriptDirCache
  _scriptDirCache = normalize(
    mp.get_script_file().split("/").slice(0, -1).join("/"),
  )
  return _scriptDirCache
}

let _scriptConfigDirCache: string
export function getScriptConfigDir(): string {
  if (_scriptConfigDirCache) {
    return _scriptConfigDirCache
  }
  _scriptConfigDirCache = joinPath(getScriptDir(), ConfigDir)
  return _scriptConfigDirCache
}
export function getModulePaths(): string[] {
  return mp.module_paths
}

export function log(level: LogLevel, ...msg: unknown[]) {
  return mp.msg.log(level, ...msg)
}

export function fatal(...msg: unknown[]) {
  return mp.msg.fatal(...msg)
}

export function error(...msg: unknown[]) {
  return mp.msg.error(...msg)
}

export function warn(...msg: unknown[]) {
  return mp.msg.warn(...msg)
}

export function info(...msg: unknown[]) {
  return mp.msg.info(...msg)
}

export function verbose(...msg: unknown[]) {
  return mp.msg.verbose(...msg)
}

export function debug(...msg: unknown[]) {
  return mp.msg.debug(...msg)
}

export function trace(...msg: unknown[]) {
  return mp.msg.trace(...msg)
}

export function readOptions(
  table: Record<string, string | boolean | number>,
  identifier?: string,
  onUpdate?: (changelist: Record<string, boolean | undefined>) => void,
) {
  if (typeof onUpdate === "function")
    return mp.options.read_options(table, identifier, onUpdate)
  return mp.options.read_options(table, identifier)
}

export function getcwd(): string | undefined {
  return mp.utils.getcwd()
}

export function readdir(
  path: string,
  filter?: "files" | "dirs" | "normal" | "all",
): string[] | undefined {
  return mp.utils.readdir(path, filter)
}

export function fileInfo(path: string): FileInfo | undefined {
  return mp.utils.file_info(path)
}

export function splitPath(path: string): [string, string] {
  return mp.utils.split_path(path)
}

export function joinPath(...paths: string[]): string {
  return normalize(paths.reduce((cur, pre) => mp.utils.join_path(cur, pre)))
}

export function getpid(): number {
  return mp.utils.getpid()
}

export function getenv(name: string): string | undefined {
  return mp.utils.getenv(name)
}

export function getUserPath(path: string): string {
  return mp.utils.get_user_path(path)
}

// export function getSc

export function readFile(fname: string, max?: number): string {
  return mp.utils.read_file(fname, max)
}

export function writeFile(filePath: string, str: string, prefix = "file://") {
  const p = prefix + normalize(filePath)
  return mp.utils.write_file(p, str)
}

export function compileJs(
  fname: string,
  content_str: string,
): (...args: unknown[]) => unknown {
  return mp.utils.compile_js(fname, content_str)
}

// export function print(...msg: any[]) {
//   // TODO: error TS2556
//   // return print(...msg)
//   return print(...msg)
// }

// export function dump(...msg: unknown[]) {
//   return dump(...msg)
// }

// export function exit() {
//   return exit()
// }

// export function setTimeout(fn: () => void, dur = 16): number {
//   return +setTimeout(fn, dur)
// }

// export function setInterval(fn: () => void, dur = 16): number {
//   return +setInterval(fn, dur)
// }

// export function clearInterval(id: number) {
//   return clearInterval(id)
// }

// export function clearTimeout(id: number) {
//   return clearTimeout(id)
// }

// export function JsonStringify(obj: any) {
//   return JSON.stringify(obj)
// }

// export function JsonParse(str: string) {
//   return JSON.parse(str)
// }

// export function getOptions() {
//   return mp.options
// }

export function getMousePos(): MousePos {
  return mp.get_mouse_pos()
}

export function getGeometry() {
  const s = getPropertyString("geometry")!
  const regex = /\d+/g
  const [w, h, x, y] = [...(s.match(regex) || [])].map((i) => +i)
  return { w: w, h: h, x: x, y: y }
}

export function setGeometry(w: number, h: number, x: number, y: number) {
  const s = [w, "x", h, "+", x, "+", y].join("")
  setPropertyString("geometry", s)
}

export function getMpvExePath() {
  const configPath = expandPath("~~home/")

  const exeName = getOs() === "windows" ? "mpv.exe" : "mpv"

  const exePath = joinPath(...splitPath(configPath).slice(0, -1), exeName)
  if (getOs() === "windows") {
    return normalize(exePath)
  }
  return exePath
}

export function getMpvExeDir() {
  return dirname(getMpvExePath())!
}

export function getColor(name: string): string | undefined {
  const prop = getPropertyString(name)
  if (!prop) return
  return new Argb(prop, true).toBgra().toHex("#")
}

export function getDesktopDir() {
  return normalize(expandPath("~~desktop/"))
}

let screenshotId = 1
type TemplateData = {
  f: string // Filename of the video
  x: string // Directory path of the video
  p: string // Current playback time (HH:MM:SS)
  P: string // Playback time with milliseconds (HH:MM:SS.mmm)
  ext: string
}

function expandScreenshotTemplate(
  template: string,
  data: TemplateData,
): string {
  const id = screenshotId++
  // template = template.replaceAll("%%", "%")
  template = template.replaceAll("%n", id.toString().padStart(4, "0"))
  template = template.replaceAll("%f", data.f)
  template = template.replaceAll("%F", data.f.replace(/\.[^/.]+$/, ""))
  template = template.replaceAll("%x", data.x)
  template = template.replaceAll("%X", data.x)
  template = template.replaceAll("%p", data.p)
  template = template.replaceAll("%P", data.P)
  return `${template}.${data.ext}`
}

function formatTime(milliseconds: number, includeMilliseconds = false): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const ms = milliseconds % 1000

  const formattedTime = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join("_")

  if (includeMilliseconds) {
    return `${formattedTime}.${ms.toFixed(3).toString().padStart(3, "0")}`
  }
  return formattedTime
}

export function getScreenshotPath(): string | undefined {
  const path = getPropertyString("path")
  if (!path) return

  const absPath = expandPath(path)
  const f = getFileName(absPath)
  const x = dirname(absPath)?.split("/").at(-1)

  if (!f || !x) {
    return
  }

  const p = getPropertyNumber("playback-time", 0)
  const P = getPropertyNumber("playback-time/full", 0)
  const tpl = getPropertyString("screenshot-template", "~~desktop/MPV-%P-N%n")
  const absTpl = expandPath(tpl)
  const ext = getPropertyString("screenshot-format", "png")
  const config = {
    f,
    x,
    p: formatTime(p),
    P: formatTime(P, true),
    ext,
  }

  let s = expandScreenshotTemplate(absTpl, config)
  while (existsSync(s)) {
    s = expandScreenshotTemplate(absTpl, config)
  }
  return normalize(s)
}
