import type { MPV } from "@mpv-easy/tool"

const log = globalThis.print

const mp = globalThis.mp || {}
globalThis.mp = mp
mp.msg = { log } as MPV["msg"]
mp.msg.verbose = log.bind(null, "v")

const levels = ["fatal", "error", "warn", "info", "debug", "trace"] as const

levels.forEach((lv) => {
  mp.msg[lv] = log.bind(null, lv)
})

// the following return undefined on error, null passthrough, or legacy object
mp.get_osd_size = function get_osd_size() {
  const d = mp.get_property_native("osd-dimensions") as any
  return d && { width: d.w, height: d.h, aspect: d.aspect }
}
mp.get_osd_margins = function get_osd_margins() {
  var d = mp.get_property_native("osd-dimensions") as any
  return d && { left: d.ml, right: d.mr, top: d.mt, bottom: d.mb }
}

mp.command_native = (table) => {
  if (Array.isArray(table)) {
    let rt = __mp.__command_json(table)
    return rt
  }
  return __mp.__command_native(table)
}
mp.command = (cmd: string) => {
  // log("command_native: " + cmd)
  __mp.__command_string(cmd)
  return undefined
}

mp.commandv = (...args: string[]) => {
  // log("commandv: ")
  __mp.__commandv(args)
  return undefined
}

let command_native_async_id = 1
mp.command_native_async = (table, fn) => {
  // log("command_native_async: ")
  // const s = mp.command_native_async(table)
  // fn?.(true, s, undefined)
  const id = command_native_async_id++
  __mp.__command_native_async(id, table)
}

mp.abort_async_command = (...args) => {
  // log("abort_async_command: ")
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
  } catch (e) {
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
  __mp.__set_property_number(name, v)
  return undefined
}

mp.set_property = (...args) => {
  // log("setProperty: " + args.join(", "))
  return undefined
}

mp.set_property_string = (name, v) => {
  // log('set_property_bool: ' + name + v)
  __mp.__set_property_string(name, v)
  return undefined
}

mp.set_property_bool = (name, v) => {
  // log('set_property_bool: ' + name + v)
  __mp.__set_property_bool(name, v)
  return undefined
}

mp.set_property_native = (...args) => {
  // log("set_property_native: " + args.join(", "))
  return undefined
}

mp.get_time = () => Date.now() / 1000

mp.add_key_binding = (...args) => {
  // log("add_key_binding: " + args.join(", "))
}
mp.add_forced_key_binding = (...args) => {
  // log("add_forced_key_binding: " + args.join(", "))
}

mp.remove_key_binding = (...args) => {
  // log("remove_key_binding: " + args.join(", "))
}

mp.register_event = (...args) => {
  // log("register_event: " + args.join(", "))
}

mp.unregister_event = (...args) => {
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
  var v = mp.get_property_native<any>("options/script-opts")?.[key]
  return typeof v != "undefined" ? v : def
}

mp.get_script_name = (...args) => {
  // log("get_script_name: " + args.join(", "))
  return globalThis.__script_name
}

mp.osd_message = (...args) => {
  // log("osd_message: " + args.join(", "))
}

mp.register_idle = (...args) => {
  // log("register_idle: " + args.join(", "))
}

mp.unregister_idle = (...args) => {
  // log("unregister_idle: " + args.join(", "))
}
mp.enable_messages = (...args) => {
  // log("enable_messages: " + args.join(", "))
}
mp.unregister_script_message = (...args) => {
  // log("unregister_script_message: " + args.join(", "))
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
      const box = __mp.__command_json(cmd)
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
mp.set_osd_ass = (...args) => {
  // log("set_osd_ass: " + args.join(", "))
}
mp.get_osd_size = (...args) => {
  // log("get_osd_size: " + args.join(", "))
  return undefined
}

mp.get_osd_margins = (...args) => {
  // log("get_osd_margins: " + args.join(", "))
  return undefined
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
  read_options(...args) {
    // log("read_options: " + args.join(", "))
  },
}

mp.utils = {
  getcwd(...args) {
    // log("read_options: " + args.join(", "))
    return mp.get_property("working-directory")
  },
  readdir(path) {
    // log("readdir: " + path)
    if (!__mp.__file_exists(path)) {
      return undefined
    }

    return __mp.__read_dir(path)
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
    return p1 + "/" + p2
  },
  getpid(...args) {
    // log("getpid: " + args.join(", "))
    return mp.get_property_number("pid")!
  },
  getenv(...args) {
    // log("getenv: " + args.join(", "))
    return undefined
  },
  get_user_path(path) {
    // log("get_user_path: " + path)
    return mp.command_native(["expand-path", String(path)]) as string
  },
  read_file(path) {
    // log("read_file: " + path)
    return __mp.__read_file(path)
  },
  write_file(path: string, text: string) {
    // log("write_file: " + path + text)
    __mp.__write_file(path, text)
  },
  compile_js(...args) {
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
let intervalIdMap: Record<number, number> = {}
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

globalThis.__mp_main = () => {
  // log("__mp_main")
}
