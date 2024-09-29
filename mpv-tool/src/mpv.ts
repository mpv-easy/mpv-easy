import { getOs } from "./common"
import { ConfigDir } from "./const"
import { normalize } from "./path"
import { getDefaultBinDirPath } from "./rs-ext"
import type {
  AddKeyBindingFlags,
  FileInfo,
  LogLevel,
  MPV,
  MousePos,
  MpvType,
  OSDMargins,
  MpvOsdOverlay,
  OSDSize,
  StrToType,
  CommandResult,
} from "./type"

export function getMPV(): MPV {
  // @ts-ignore
  return globalThis.mp
}

export function command(command: string): true | undefined {
  return getMPV().command(command)
}

export function commandv(...args: string[]): true | undefined {
  return getMPV().commandv(...args)
}

export function commandNative(table: unknown): CommandResult {
  return getMPV().command_native(table)
}

export function commandNativeAsync(
  table: {
    name: string
    args?: string[]
    playback_only?: boolean
    capture_stdout?: boolean
    capture_stderr?: boolean
  },
  fn?: (
    success: boolean,
    result: CommandResult,
    error: string | undefined,
  ) => void,
): number {
  return getMPV().command_native_async(table, fn)
}

export function abortAsyncCommand(t: number) {
  return getMPV().abort_async_command(t)
}

export function getProperty(name: string, def?: string): string | undefined {
  return getMPV().get_property(name, def)
}

export function getPropertyOsd(name: string, def?: string): string {
  return getMPV().get_property_osd(name, def)
}

export function getPropertyBool(name: string, def?: boolean): boolean {
  return !!getMPV().get_property_bool(name, def)
}
export function getPropertyString(
  name: string,
  def?: string,
): string | undefined {
  return getMPV().get_property_native<string>(name, def)
}

export function getPropertyNumber(
  name: string,
  def?: number,
): number | undefined {
  return getMPV().get_property_number(name, def)
}

export function getPropertyNative<T>(name: string, def?: unknown): T {
  return getMPV().get_property_native<T>(name, def)
}

export function setProperty(name: string, value: string): true | undefined {
  return getMPV().set_property(name, value)
}

export function setPropertyBool(
  name: string,
  value: boolean,
): true | undefined {
  return getMPV().set_property_bool(name, value)
}
export function setPropertyString(
  name: string,
  value: string,
): true | undefined {
  return getMPV().set_property(name, value)
}

export function setPropertyNumber(
  name: string,
  value: number,
): true | undefined {
  return getMPV().set_property_number(name, value)
}

export function setPropertyNative(
  name: string,
  value: unknown,
): true | undefined {
  return getMPV().set_property_native(name, value)
}

export function getTime(): number {
  return getMPV().get_time()
}

export type KeyEvent = {
  key: string
  event: "up" | "down" | "press"
  is_mouse: boolean
  key_name?:
    | "WHEEL_DOWN"
    | "WHEEL_UP"
    | "MBTN_LEFT"
    | "MBTN_RIGHT"
    | (string & {})
}

export function addKeyBinding(
  key: string,
  name?: string,
  fn?: (event: KeyEvent) => void,
  flags?: AddKeyBindingFlags,
) {
  return getMPV().add_key_binding(key, name, fn, flags)
}

export function addForcedKeyBinding(
  key: string,
  name?: string,
  fn?: (event: KeyEvent) => void,
  flags?: AddKeyBindingFlags,
) {
  return getMPV().add_forced_key_binding(key, name, fn, flags)
}

export function removeKeyBinding(name: string) {
  return getMPV().remove_key_binding(name)
}

export function registerEvent(
  name: string,
  fn: (event: Record<string, unknown>) => void,
) {
  return getMPV().register_event(name, fn)
}

export function unregisterEvent(fn: (...args: unknown[]) => void) {
  return getMPV().unregister_event(fn)
}

export function observeProperty<T extends keyof MpvType, P = StrToType<T>>(
  name: string,
  type: T,
  fn: (name: string, value: P) => void,
) {
  return getMPV().observe_property(name, type as any, fn as any)
}

export function observePropertyNumber(
  name: string,
  fn: (value: number) => void,
) {
  return observeProperty(name, "number", (name: string, v: number) => fn(v))
}

export function unobserveProperty(fn: (...args: unknown[]) => void) {
  return getMPV().unobserve_property(fn)
}

export function getOpt(key: string): string {
  return getMPV().get_opt(key)
}

export function getScriptName(): string {
  return getMPV().get_script_name()
}

export function osdMessage(text: string, seconds?: number) {
  return getMPV().osd_message(text, seconds)
}

export function registerIdle(fn: () => void) {
  return getMPV().register_idle(fn)
}

export function unregisterIdle(fn: () => void) {
  return getMPV().unregister_idle(fn)
}

export function enableMessages(level: LogLevel) {
  return getMPV().enable_messages(level)
}

export function registerScriptMessage(
  name: string,
  fn: (...args: unknown[]) => void,
) {
  return getMPV().register_script_message(name, fn)
}

export function unregisterScriptMessage(name: string) {
  return getMPV().unregister_script_message(name)
}

export type VideoParams = {
  aspect: number
  "aspect-name": string
  "average-bpp": number
  "chroma-location": string
  colorlevels: string
  colormatrix: string
  "crop-h": number
  "crop-w": number
  "crop-x": number
  "crop-y": number
  dh: number
  dw: number
  gamma: string
  h: number
  light: string
  par: number
  pixelformat: string
  primaries: string
  rotate: number
  sar: number
  "sar-name": string
  "sig-peak": number
  "stereo-in": string
  w: number
}

export function createOsdOverlay(
  format: "ass-events" = "ass-events",
): MpvOsdOverlay {
  return getMPV().create_osd_overlay(format)
}

export function setOsdAss(res_x: number, res_y: number, data: string) {
  getMPV().set_osd_ass(res_x, res_y, data)
}

export function getOsdSize(): OSDSize | undefined {
  return getMPV().get_osd_size()
}

export function getOsdMargins(): OSDMargins | undefined {
  return getMPV().get_osd_margins()
}

export function addHook(name: string, priority: number, fn: () => void) {
  return getMPV().add_hook(name, priority, fn)
}

export function lastError(): string {
  return getMPV().last_error()
}

export function getTimeMs(): number {
  return getMPV().get_time_ms()
}

export function getScriptFile(): string {
  return getMPV().get_script_file()
}

let _scriptDirCache: string
export function getScriptDir(): string {
  if (_scriptDirCache) return _scriptDirCache
  _scriptDirCache = normalize(
    getMPV().get_script_file().split("/").slice(0, -1).join("/"),
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
  return getMPV().module_paths
}

export function log(level: LogLevel, ...msg: unknown[]) {
  return getMPV().msg.log(level, ...msg)
}

export function fatal(...msg: unknown[]) {
  return getMPV().msg.fatal(...msg)
}

export function error(...msg: unknown[]) {
  return getMPV().msg.error(...msg)
}

export function warn(...msg: unknown[]) {
  return getMPV().msg.warn(...msg)
}

export function info(...msg: unknown[]) {
  return getMPV().msg.info(...msg)
}

export function verbose(...msg: unknown[]) {
  return getMPV().msg.verbose(...msg)
}

export function debug(...msg: unknown[]) {
  return getMPV().msg.debug(...msg)
}

export function trace(...msg: unknown[]) {
  return getMPV().msg.trace(...msg)
}

export function readOptions(
  table: Record<string, string | boolean | number>,
  identifier?: string,
  on_update?: (list: Record<string, boolean | undefined>) => void,
) {
  return getMPV().options.read_options(table, identifier, on_update)
}

export function getcwd(): string | undefined {
  return getMPV().utils.getcwd()
}

export function readdir(
  path: string,
  filter?: "files" | "dirs" | "normal" | "all",
): string[] | undefined {
  return getMPV().utils.readdir(path, filter)
}

export function fileInfo(path: string): FileInfo | undefined {
  return getMPV().utils.file_info(path)
}

export function splitPath(path: string): [string, string] {
  return getMPV().utils.split_path(path)
}

export function joinPath(...paths: string[]): string {
  return normalize(
    paths.reduce((cur, pre) => getMPV().utils.join_path(cur, pre)),
  )
}

export function getpid(): number {
  return getMPV().utils.getpid()
}

export function getenv(name: string): string | undefined {
  return getMPV().utils.getenv(name)
}

export function getUserPath(path: string): string {
  return getMPV().utils.get_user_path(path)
}

// export function getSc

export function readFile(fname: string, max?: number): string {
  return getMPV().utils.read_file(fname, max)
}

export function writeFile(filePath: string, str: string, prefix = "file://") {
  const p = prefix + normalize(filePath)
  return getMPV().utils.write_file(p, str)
}

export function compileJs(
  fname: string,
  content_str: string,
): (...args: unknown[]) => unknown {
  return getMPV().utils.compile_js(fname, content_str)
}

export function print(...msg: any[]) {
  // TODO: error TS2556
  // return globalThis.print(...msg)
  return globalThis.print(...msg)
}

export function dump(...msg: unknown[]) {
  return globalThis.dump(...msg)
}

export function exit() {
  return globalThis.exit()
}

export function setTimeout(fn: () => void, dur = 1000): number {
  return +globalThis.setTimeout(fn, dur)
}

export function setInterval(fn: () => void, dur = 1000): number {
  return +globalThis.setInterval(fn, dur)
}

export function clearInterval(id: number) {
  return globalThis.clearInterval(id)
}

export function clearTimeout(id: number) {
  return globalThis.clearTimeout(id)
}

// export function JsonStringify(obj: any) {
//   return JSON.stringify(obj)
// }

// export function JsonParse(str: string) {
//   return JSON.parse(str)
// }

export function getOptions() {
  return getMPV().options
}

export function getMousePos(): MousePos {
  return getMPV().get_mouse_pos()
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
  const configPath = commandNative([
    "expand-path",
    "~~home/",
  ]) as unknown as string

  const exeName = getOs() === "windows" ? "mpv.exe" : "mpv"

  const exePath = joinPath(...splitPath(configPath).slice(0, -1), exeName)
  if (getOs() === "windows") {
    return exePath.replaceAll("/", "\\\\")
  }
  return exePath
}
