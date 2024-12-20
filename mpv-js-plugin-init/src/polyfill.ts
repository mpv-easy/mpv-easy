import type { MpApi, MpvWaitEvent } from "./type"

if (!Array.prototype.at) {
  Array.prototype.at = function (index) {
    if (index >= 0) {
      return this[index]
    }
    return this[this.length + index]
  }
}

const core = globalThis.Deno.core
const ops = core.ops

globalThis.print = (...args) =>
  globalThis.Deno.core.print(`${args.join(" ")}\n`)

declare global {
  var Deno: {
    core: {
      print: (s: string) => void
      ops: {
        op_commandv: (args: string[]) => void
        op_command_string: (cmd: string) => void
        op_get_property_string: (name: string) => string
        op_get_cwd: () => string
        op_set_property_bool: (name: string, v: boolean) => void
        op_set_property_number: (name: string, v: number) => void
        op_set_property_string: (name: string, v: string) => void
        op_read_file: (name: string) => string
        op_write_file: (name: string, text: string) => void
        op_file_size: (path: string) => number
        op_file_exists: (path: string) => boolean
        op_is_file: (path: string) => boolean
        op_read_dir: (path: string) => string[]
        op_command_native: (name: string, args: string[]) => string
        op_command_native_async: (name: string, args: string[]) => void
        op_command_json: (args: string) => string
        op_getenv: (name: string) => string | undefined
      }
    }
  }
}

const __mp: MpApi = {
  __commandv: (args) => {
    const cmd = args.map((i) => (typeof i === "string" ? i : i.toString()))
    ops.op_commandv(cmd)
  },
  __command_string: ops.op_command_string,
  __get_property_string: ops.op_get_property_string,
  __set_property_bool: ops.op_set_property_bool,
  __set_property_number: ops.op_set_property_number,
  __set_property_string: ops.op_set_property_string,
  __command_json: ops.op_command_json,
  __read_file: ops.op_read_file,
  __getenv: ops.op_getenv,
  __write_file: (path, text) => {
    const prefix = "file://"
    const p = path.startsWith(prefix) ? path.slice(prefix.length) : path
    ops.op_write_file(p, text)
  },

  __file_size: ops.op_file_size,
  __file_exists: ops.op_file_exists,
  __is_file: ops.op_is_file,
  __read_dir: ops.op_read_dir,

  __command_native: (table: any) => {
    const name = table.name
    const args = table.args

    const stdout = ops.op_command_native(name, args)
    return {
      // TODO
      // error_string: string
      // killed_by_us: boolean
      // status: number
      // stderr: string
      // stdout: string
      status: 0,
      stdout,
    }
  },
  __command_native_async: (id, table: any) => {
    const { name, args = [] } = table
    ops.op_command_native_async(name, args)
  },
  __get_property_native: (name: string) => {
    throw new Error("Function not implemented.")
  },
  __get_property_number: (name: string): number => {
    throw new Error("Function not implemented.")
  },
  __get_property_bool: (name: string): boolean => {
    throw new Error("Function not implemented.")
  },
  __set_property_native: (name: string, v: string): void => {
    throw new Error("Function not implemented.")
  },
  __request_event: (name: string, flag: boolean) => {
    throw new Error("Function not implemented.")
  },
  __observe_property: (
    id: number,
    name: string,
    format?: string | undefined,
  ) => {
    throw new Error("Function not implemented.")
  },
  __unobserve_property: (id: number) => {
    throw new Error("Function not implemented.")
  },

  __abort_async_command: (id: number): void => {
    throw new Error("Function not implemented.")
  },
  __set_last_error: (s: string): void => {
    throw new Error("Function not implemented.")
  },
  __wait_event: (wait: number): MpvWaitEvent => {
    throw new Error("Function not implemented.")
  },
}
globalThis.__mp = __mp
