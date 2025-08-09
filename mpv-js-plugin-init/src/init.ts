// @ts-nocheck

import type { MP } from "@mpv-easy/tool"

const log = globalThis.print

const mp = globalThis.mp || {}
globalThis.mp = mp
mp.msg = { log } as MP["msg"]
mp.msg.verbose = log.bind(null, "v")

if (!globalThis.console) {
  globalThis.console = {
    log: log,
    error: log,
    info: log,
    debug: log,
    warn: log,
  } as any
}

const levels = ["fatal", "error", "warn", "info", "debug", "trace"] as const

for (const lv of levels) {
  mp.msg[lv] = log.bind(null, lv)
}

// the following return undefined on error, null passthrough, or legacy object
mp.get_osd_size = function get_osd_size() {
  const d = mp.get_property_native("osd-dimensions")
  return d && { width: d.w, height: d.h, aspect: d.aspect }
}
mp.get_osd_margins = function get_osd_margins() {
  const d = mp.get_property_native("osd-dimensions")
  return d && { left: d.ml, right: d.mr, top: d.mt, bottom: d.mb }
}

mp.command_native = (table) => {
  if (Array.isArray(table)) {
    const rt = JSON.parse(__mp.__command_json(JSON.stringify(table)))
    return rt
  }
  return __mp.__command_native(table)
}
mp.command = (cmd: string) => {
  // log("command_native: " + cmd)
  return __mp.__command_string(cmd)
}

mp.commandv = (...args: string[]) => {
  // log("commandv: ")
  return __mp.__commandv(args)
}

let command_native_async_id = 1
mp.command_native_async = (table, fn) => {
  // log("command_native_async: ")
  // const s = mp.command_native_async(table)
  // fn?.(true, s, undefined)
  const id = command_native_async_id++
  return __mp.__command_native_async(id, table, fn)
}

mp.abort_async_command = (..._args) => {
  log("abort_async_command: not support yet")
}

mp.get_property = (name, def) => {
  // log("get_property: " + name)
  return __mp.__get_property_string(name) ?? def
  // __mp.__get_property_native(name)
}

// mp.get_property_osd = (...args) => {
//   // log("get_property_osd: "+args.join(", "))
// }

mp.get_property_bool = (name) => {
  // log("get_property_bool: " + name.toString())
  const v = __mp.__get_property_string(name)
  // log("get_property_bool v: " + v.toString())
  return v === "yes"
}

mp.get_property_string = (name) => {
  // log("get_property_string: " + name)
  const v = __mp.__get_property_string(name)
  // log("get_property_string22: " + v)
  return v
}

mp.get_property_native = <T>(name: string): T => {
  // log("get_property_native: " + name.toString())
  const s = __mp.__get_property_string(name)
  try {
    const v = JSON.parse(s)
    return v
  } catch (_e) {
    return s as T
  }
}

mp.get_property_number = (name) => {
  // log('get_property_number: ' + name.toString())
  const s = __mp.__get_property_string(name)
  // log('get_property_number: ' + s)
  return +s
}

mp.set_property_number = (name, v: number) => {
  // log("get_property_number: " + name.toString())
  return __mp.__set_property_number(name, v)
}

mp.set_property = (_name, v) => {
  // log("setProperty: " + args.join(", "))
  switch (typeof v) {
    case "string": {
      return mp.set_property_string(v)
    }
    case "number": {
      return mp.set_property_number(v)
    }
    case "boolean": {
      return mp.set_property_bool(v)
    }
    case "bigint":
    case "symbol":
    case "undefined":
    case "object":
    case "function": {
      throw new Error(`set_property not support v: ${v}`)
    }
  }
  return undefined
}

mp.set_property_string = (name, v) => {
  // log('set_property_string: ' + name + v)
  return __mp.__set_property_string(name, v)
}

mp.set_property_bool = (name, v) => {
  // log('set_property_bool: ' + name + v)
  return __mp.__set_property_bool(name, v)
}

mp.set_property_native = (...args) => {
  log("set_property_native not support yet", args.join(", "))
  return undefined
}

mp.get_time = () => Date.now() / 1000

mp.add_key_binding = (..._args) => {
  log("add_key_binding not support yet")
  // log("add_key_binding: " + args.join(", "))
}
mp.add_forced_key_binding = (..._args) => {
  log("add_forced_key_binding not support yet")
  // log("add_forced_key_binding: " + args.join(", "))
}

mp.remove_key_binding = (..._args) => {
  log("remove_key_binding not support yet")
  // log("remove_key_binding: " + args.join(", "))
}

mp.register_event = (..._args) => {
  log("register_event not support yet")
  // log("register_event: " + args.join(", "))
}

mp.unregister_event = (..._args) => {
  log("unregister_event not support yet")
  // log("unregister_event: " + args.join(", "))
}

const observePropertyMap: Record<
  string,
  {
    fn: (name: string, v: any) => void
    type: "string" | "number" | "bool" | "native" | "none" | undefined
    value: any
  }[]
> = {}

const dispatchEventMap: Record<string, Function> = {}

mp.observe_property = (name, type, fn) => {
  // log("observe_property: " + name)
  if (!observePropertyMap[name]) {
    observePropertyMap[name] = [
      {
        type,
        value: undefined,
        fn,
      },
    ]
  } else {
    observePropertyMap[name].push({
      type,
      value: undefined,
      fn,
    })
  }
}

mp.unobserve_property = (fn) => {
  // log("unobserve_property: ")
  for (const name in observePropertyMap) {
    const item = observePropertyMap[name] ?? []
    const index = item.findIndex((i) => i.fn === fn)
    if (index >= 0) {
      item.splice(index, 1)
    }
  }
}

function runObserve() {
  for (const name in observePropertyMap) {
    const item = observePropertyMap[name] || []

    for (const i of item) {
      if (i.type === "native") {
        const v = mp.get_property_native(name)
        if (JSON.stringify(v) !== JSON.stringify(i.value)) {
          i.fn(name, v)
          i.value = v
        }
      } else if (i.type === "bool") {
        const v = mp.get_property_bool(name)
        if (v !== i.value) {
          i.fn(name, v)
          i.value = v
        }
      } else if (i.type === "number") {
        const v = mp.get_property_number(name)
        if (v !== i.value) {
          i.fn(name, v)
          i.value = v
        }
      } else if (i.type === "string") {
        const v = mp.get_property_string(name)
        if (v !== i.value) {
          i.fn(name, v)
          i.value = v
        }
      }
    }
  }
}

mp.get_opt = (key, def) => {
  // log("get_opt: " + key + def)
  const v = mp.get_property_native<any>("options/script-opts")?.[key]
  return typeof v !== "undefined" ? v : def
}

mp.get_script_name = (..._args) => {
  // log("get_script_name: " + args.join(", "))
  return globalThis.__script_name
}

mp.osd_message = (text: string, duration?: number) => {
  mp.commandv("show_text", text, Math.round(1000 * (duration || -1)))
}
mp.register_idle = (..._args) => {
  // log("register_idle: " + args.join(", "))
}

mp.unregister_idle = (..._args) => {
  // log("unregister_idle: " + args.join(", "))
}
mp.enable_messages = (..._args) => {
  // log("enable_messages: " + args.join(", "))
}
mp.unregister_script_message = (name: String) => {
  // log("unregister_script_message: ", name)
  delete dispatchEventMap[name]
}
mp.register_script_message = (name: string, fn: Function) => {
  // log("register_script_message: ", name, fn)
  dispatchEventMap[name] = fn
}

let next_osd_overlay_id = 1
mp.create_osd_overlay = () => {
  const id = next_osd_overlay_id++
  return {
    format: "ass-events",
    id,
    data: "",
    res_x: 0,
    res_y: 720,
    z: 1,
    hidden: false,
    compute_bounds: false,
    update() {
      const cmd = [
        "osd-overlay",
        this.id ?? 0,
        "ass-events",
        this.data.toString(),
        this.res_x,
        this.res_y,
        this.z,
        this.hidden ? "yes" : "no",
        this.compute_bounds ? "yes" : "no",
      ].map((i) => i.toString())
      const box = __mp.__command_json(JSON.stringify(cmd))
      const obj = JSON.parse(box)
      return obj
    },

    remove() {
      // log('ovl remove: ' + this.id)
      if (this.id) {
        __mp.__commandv(["remove", this.id.toString(), "none", ""])
      }
    },
  }
  // // log('create_osd_overlay: ', args.join(', '))
}
mp.set_osd_ass = (res_x: number, res_y: number, data: string) => {
  // log("set_osd_ass: " + args.join(", "))
  if (!mp._legacy_overlay)
    mp._legacy_overlay = mp.create_osd_overlay("ass-events")

  const lo = mp._legacy_overlay
  if (lo.res_x === res_x && lo.res_y === res_y && lo.data === data) return true

  mp._legacy_overlay.res_x = res_x
  mp._legacy_overlay.res_y = res_y
  mp._legacy_overlay.data = data
  return mp._legacy_overlay.update()
}

mp.get_osd_margins = (..._args) => {
  // log("get_osd_margins: " + args.join(", "))
  const d = mp.get_property_native("osd-dimensions")
  return d && { left: d.ml, right: d.mr, top: d.mt, bottom: d.mb }
}
mp.get_time_ms = () => {
  // log("get_time_ms: ")
  return Date.now()
}

mp.get_script_file = () => {
  // const p =
  //   mp.get_property_string("working-directory") +
  //   "/portable_config/scripts-qjs/qjs.js"
  return globalThis.__script_path
}

mp.get_mouse_pos = () => {
  // log("get_mouse_pos: ")
  return mp.get_property_native("mouse-pos")
}

mp.module_paths = []

mp.msg = {
  log: log,
  warn: log,
  info: log,
  error: log,
  fatal: log,
  verbose: log,
  debug: log,
  trace: log,
}

mp.options = {
  read_options(opts, id, on_update, _conf_override) {
    // log("read_options: " + args.join(", "))
    const _name = String(id ? id : mp.get_script_name())
    const fname = `~~/script-opts/${id}.conf`
    let conf: string
    try {
      // conf = arguments.length > 3 ? conf_override : mp.utils.read_file(fname);
      conf = mp.utils.read_file(fname)
    } catch (_e) {
      mp.msg.verbose(`${fname} not found.`)
    }

    // data as config file lines array, or empty array
    const data = conf ? conf.replace(/\r\n/g, "\n").split("\n") : []
    const conf_len = data.length // before we append script-opts below

    const sopts = mp.get_property_native("options/script-opts")
    const prefix = `${id}-`
    for (const key in sopts) {
      if (key.indexOf(prefix) === 0)
        data.push(`${key.substring(prefix.length)}=${sopts[key]}`)
    }

    // Update opts from data
    data.forEach((line, i) => {
      if (line[0] === "#" || line.trim() === "") return

      const key = line.substring(0, line.indexOf("="))
      const val = line.substring(line.indexOf("=") + 1)
      const type = typeof opts[key]
      const info =
        i < conf_len
          ? `${fname}:${i + 1}` // 1-based line number
          : `script-opts:${prefix}${key}`

      // biome-ignore lint/suspicious/noPrototypeBuiltins: hack
      if (!opts.hasOwnProperty(key))
        mp.msg.warn(info, `Ignoring unknown key '${key}'`)
      else if (type === "string") opts[key] = val
      else if (type === "boolean" && (val === "yes" || val === "no"))
        opts[key] = val === "yes"
      else if (type === "number" && val.trim() !== "" && !Number.isNaN(val))
        opts[key] = Number(val)
      else mp.msg.error(info, `Error: can't convert '${val}' to ${type}`)
    })

    if (on_update) {
      mp.observe_property("options/script-opts", "native", (_n, _v) => {
        const saved = JSON.parse(JSON.stringify(opts)) // clone
        const changelist = {}
        let changed = false
        mp.read_options(opts, id, 0, conf) // re-apply orig-file + script-opts
        for (const key in opts) {
          if (opts[key] !== saved[key])
            // type always stays the same
            changelist[key] = changed = true
        }
        if (changed) on_update(changelist)
      })
    }
  },
}

mp.utils = {
  getcwd(..._args) {
    // log("read_options: " + args.join(", "))
    return mp.get_property("working-directory")
  },
  readdir(path, filter) {
    // log("readdir: " + path)
    if (!__mp.__file_exists(path)) {
      return undefined
    }

    return __mp.__read_dir(path, filter)
  },
  file_info(path: string) {
    // log("file_info: " + path)
    if (!__mp.__file_exists(path)) {
      return undefined
    }
    const is_file = __mp.__is_file(path)
    const size = is_file ? __mp.__file_size(path) : 0
    // TODO: mode, atime,mtime,ctime
    return {
      mode: is_file ? 644 : 755,
      atime: 0,
      mtime: 0,
      ctime: 0,
      size,
      is_dir: !is_file,
      is_file,
    }
  },
  split_path(path) {
    // log("split_path: " + path)
    const list = path.split("/")
    return [list.slice(0, -1).join("/"), list.at(-1) || ""] as const
  },
  join_path(p1: string, p2: string) {
    // log("join_path: " + p1 + "/" + p2)
    return `${p1}/${p2}`
  },
  getpid(..._args) {
    // log("getpid: " + args.join(", "))
    return mp.get_property_number("pid")!
  },
  getenv(name: string) {
    // log("getenv: " + args.join(", "))
    return __mp.__getenv(name)
  },
  get_user_path(path) {
    // log("get_user_path: " + path)
    return mp.command_native(["expand-path", String(path)]) as string
  },
  read_file(path) {
    // log("read_file: " + path)
    const expandPath = mp.utils.get_user_path(path)
    return __mp.__read_file(expandPath)
  },
  write_file(path: string, text: string) {
    // log("write_file: " + path + text)
    __mp.__write_file(path, text)
  },
  compile_js(..._args) {
    // log("compile_js: " + args.join(", "))
    return () => {}
  },
}

let timeoutQueue: {
  id: number
  delay: number
  createTime: number
  fn: () => void
  execTime: number
}[] = []

let timeoutId = 1
function setTimeout(fn: () => void, delay = 1000) {
  const id = timeoutId++
  const createTime = Date.now()
  timeoutQueue.push({
    id,
    fn,
    delay,
    createTime: Date.now(),
    execTime: createTime + delay,
  })
  return id
}

let intervalId = 1
const intervalIdMap: Record<number, number> = {}
function setInterval(fn: () => void, delay = 1000) {
  const id = intervalId++
  // log('setInterval: ' + fn + delay)
  function execute() {
    fn()
    intervalIdMap[id] = setTimeout(execute, delay)
  }
  intervalIdMap[id] = setTimeout(execute, delay)
  return id
}

function execTimeout() {
  const now = Date.now()

  const needExecList: typeof timeoutQueue = []
  const nextList: typeof timeoutQueue = []

  for (const item of timeoutQueue) {
    if (item.execTime < now) {
      needExecList.push(item)
    } else {
      nextList.push(item)
    }
  }
  timeoutQueue = []
  for (const i of needExecList) {
    i.fn()
  }

  timeoutQueue = [...nextList, ...timeoutQueue]
}

globalThis.setTimeout = setTimeout
globalThis.setInterval = setInterval

globalThis.clearInterval = (id: number) => {
  // log('clearInterval: ' + id)
  globalThis.clearTimeout(intervalIdMap[id])
}
globalThis.clearTimeout = (id: number) => {
  // log('clearTimeout: ' + id)
  const index = timeoutQueue.findIndex((i) => i.id === id)
  if (index >= 0) {
    timeoutQueue.splice(index, 1)
  }
}

globalThis.__mp_tick = () => {
  // log("tick st1")
  execTimeout()
  // log("tick st2")
  runObserve()
  // log("tick end")
}

function runDispatchEvent(args: string[]) {
  const [name, ...events] = args

  const fn = dispatchEventMap[name]
  if (fn) {
    fn(...events)
  }
}

globalThis.__mp_dispatch_event = (args: string[]) => {
  execTimeout()

  runDispatchEvent(args)
}

globalThis.__mp_main = () => {
  // log("__mp_main")
}

// setInterval(() => {
//   globalThis.__mp_tick()
// }, 16);
