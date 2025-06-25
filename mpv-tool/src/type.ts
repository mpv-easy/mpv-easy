import type { KeyEvent } from "./mpv"
import {
  BoolProp,
  MousePos,
  NumberProp,
  NativeProp,
  StringProp,
} from "./type-prop"
export * from "./type-prop"
export * from "./type-cmd"

declare global {
  var mp: MP
  // @ts-ignore
  function print(...args: any[]): void
  function dump(...args: any[]): void
  function exit(): void
}

export type LogLevel =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "v"
  | "debug"
  | "trace"

export type MpvType = {
  string: string
  number: number
  bool: boolean
  native: any
}

export type StrToType<T extends keyof MpvType> = MpvType[T]

export interface AddKeyBindingFlags {
  repeatable?: boolean | undefined
  complex?: boolean | undefined
  event?: "down" | "repeat" | "up" | "press" | undefined | "unknown"
  is_mouse?: boolean | undefined
  key_name?: string | undefined
  key_text?: string | undefined
  forced?: boolean
}

export interface MpvOsdOverlay {
  id: number
  data: string
  res_x: number
  res_y: number
  z: number
  hidden: boolean
  compute_bounds: boolean
  update(): {} | { x0: number; y0: number; x1: number; y1: number }
  remove(): void
}

export interface OSDSize {
  width: number
  height: number
  aspect: number
}

export interface OSDMargins {
  left: number
  right: number
  top: number
  bottom: number
}
export interface FileInfo {
  mode: number
  size: number
  atime: number
  mtime: number
  ctime: number
  is_file: boolean
  is_dir: boolean
}

export type CommandResult = {
  error_string: string
  killed_by_us: boolean
  status: number
  stderr: string
  stdout: string
}

export type MP = {
  command(command: string): true | undefined

  commandv(
    ...args: (string | number | boolean | Object | undefined)[]
  ): true | undefined

  command_native<T = CommandResult>(table: unknown, def?: unknown): T

  command_native_async<T = CommandResult>(
    table: {
      name: string
      args?: string[]
      playback_only?: boolean
      capture_stdout?: boolean
      capture_stderr?: boolean
    },
    fn?: (success: boolean, result: T, error: string | undefined) => void,
  ): number

  abort_async_command(t: number): void

  get_property(name: StringProp | (string & {}), def: string): string
  get_property(name: StringProp | (string & {})): string | undefined

  get_property_osd(name: string, def?: string): string

  get_property_bool(name: BoolProp | (string & {}), def: boolean): boolean
  get_property_bool(name: BoolProp | (string & {})): boolean | undefined

  get_property_number(name: NumberProp | (string & {}), def: number): number
  get_property_number(name: NumberProp | (string & {})): number | undefined

  get_property_native<K extends keyof NativeProp, T = NativeProp[K]>(name: K): T
  get_property_native<K extends keyof NativeProp, T = NativeProp[K]>(
    name: K,
    def?: NoInfer<T>,
  ): T
  get_property_native<T = string | undefined | boolean | number>(
    name: string,
  ): T
  get_property_native<T = unknown>(name: string, def?: NoInfer<T>): T

  get_property_string(name: StringProp | (string & {})): string | undefined
  get_property_string(name: StringProp | (string & {}), def: string): string

  set_property(name: string, value: string): true | undefined

  set_property_bool(
    name: BoolProp | (string & {}),
    value: boolean,
  ): true | undefined

  set_property_number(
    name: NumberProp | (string & {}),
    value: number,
  ): true | undefined

  set_property_native(name: string, value: unknown): true | undefined
  set_property_string(
    name: StringProp | (string & {}),
    value: string,
  ): true | undefined

  get_time(): number
  set_osd_ass(res_x: number, res_y: number, data: string): unknown
  get_osd_margins(): OSDMargins | undefined
  get_mouse_pos(): MousePos

  add_key_binding(
    key: string,
    name?: string,
    fn?: (event: KeyEvent) => void,
    flags?: AddKeyBindingFlags,
  ): void

  add_forced_key_binding(
    key: string,
    name?: string,
    fn?: (event: KeyEvent) => void,
    flags?: AddKeyBindingFlags,
  ): void

  remove_key_binding(name: string): void

  register_event(
    name: string,
    fn: (event: Record<string, unknown>) => void,
  ): void

  unregister_event(fn: (...args: unknown[]) => void): void

  observe_property(
    name: string,
    type: "native",
    fn: (name: string, value: unknown) => void,
  ): void
  observe_property(
    name: string,
    type: "bool",
    fn: (name: BoolProp | (string & {}), value: boolean | undefined) => void,
  ): void
  observe_property(
    name: string,
    type: "string",
    fn: (name: StringProp | (string & {}), value: string | undefined) => void,
  ): void
  observe_property(
    name: string,
    type: "number",
    fn: (name: NumberProp | (string & {}), value: number | undefined) => void,
  ): void
  observe_property(
    name: string,
    type: "none" | undefined,
    fn: (name: string) => void,
  ): void

  unobserve_property(fn: (...args: unknown[]) => void): void

  get_opt(key: string, def?: string): string

  get_script_name(): string

  osd_message(text: string, duration?: number): void

  register_idle(fn: () => void): void

  unregister_idle(fn: () => void): void

  enable_messages(level: LogLevel): void

  register_script_message(name: string, fn: (...args: string[]) => void): void

  unregister_script_message(name: string): void

  create_osd_overlay(format: "ass-events"): MpvOsdOverlay

  get_osd_size(): OSDSize | undefined

  add_hook(name: string, priority: number, fn: () => void): void

  last_error(): string

  get_time_ms(): number

  get_script_file(): string

  module_paths: string[]

  msg: {
    log(level: LogLevel, ...msg: unknown[]): void

    fatal(...msg: unknown[]): void

    error(...msg: unknown[]): void

    warn(...msg: unknown[]): void

    info(...msg: unknown[]): void

    verbose(...msg: unknown[]): void

    debug(...msg: unknown[]): void

    trace(...msg: unknown[]): void
  }

  options: {
    read_options(
      table: Record<string, string | boolean | number>,
      identifier?: string,
      on_update?: (list: Record<string, boolean | undefined>) => void,
    ): void
  }

  utils: {
    getcwd(): string | undefined

    readdir(
      path: string,
      filter?: "files" | "dirs" | "normal" | "all",
    ): string[] | undefined

    file_info(path: string): FileInfo | undefined

    split_path(path: string): [string, string]

    join_path(p1: string, p2: string): string

    getpid(): number

    getenv(name: string): string | undefined

    get_user_path(path: string): string

    read_file(fname: string, max?: number): string

    write_file(fname: string, str: string): void

    compile_js(
      fname: string,
      content_str: string,
    ): (...args: unknown[]) => unknown
  }
}
