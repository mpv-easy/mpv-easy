import type { MP } from "@mpv-easy/tool"

export type MpvWaitEvent = {
  event: string
}

export type MpApi = {
  __command_native: (table: any) => any
  __get_property_native: (name: string) => any
  __get_property_string: (name: string) => string
  __get_property_number: (name: string) => number
  __get_property_bool: (name: string) => boolean

  __set_property_native: (name: string, v: string) => true | undefined
  __set_property_string: (name: string, v: string) => true | undefined
  __set_property_number: (name: string, v: number) => true | undefined
  __set_property_bool: (name: string, v: boolean) => true | undefined

  __command_string: (cmd: string) => void
  __commandv: (args: (string | number)[]) => void
  __command_json: (args: string) => string
  __file_size: (path: string) => number | undefined
  __file_exists: (path: string) => boolean
  __is_file: (path: string) => boolean
  __read_dir: (path: string) => string[] | undefined

  __request_event: (name: string, flag: boolean) => any
  __observe_property: (id: number, name: string, format?: string) => any
  __unobserve_property: (id: number) => any
  __command_native_async: (id: number, node: any, cb?: any) => number
  __abort_async_command: (id: number) => void
  __set_last_error: (s: string) => void
  __wait_event: (wait: number) => MpvWaitEvent
  __getenv: (name: string) => string | undefined
  __read_file: (name: string) => string | undefined
  __write_file: (name: string, text: string) => void
}

export type InnerMp = {
  _legacy_overlay: MpvOsdOverlay
  _keep_running: boolean
}

declare global {
  var __print: (s: string) => void
  var __mp_main: () => void
  var __mp_tick: () => void
  var __mp: MpApi
  var __script_name: string
  var __script_path: string

  var mp: MP & InnerMp
  var exit: () => void
  var setTimeout: (fn: (v?: unknown) => void, delay?: number) => number
  var setInterval: (fn: (v?: unknown) => void, delay?: number) => number
  var clearInterval: (id: number) => void
  var clearTimeout: (id: number) => void

  var print: (...args: any[]) => void
  function dump(...args: any[]): void
  function exit(): void
}
// biome-ignore lint/complexity/noUselessEmptyExport: hack
export type {}
