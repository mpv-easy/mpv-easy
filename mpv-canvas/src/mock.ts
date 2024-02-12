import {
  AddKeyBindingFlags,
  FileInfo,
  KeyEvent,
  LogLevel,
  MPV,
  MousePos,
  MpvOsdOverlay,
  OSDMargins,
  OSDSize,
} from "@mpv-easy/tool"
import { throttle } from "lodash-es"

const screenWidth = 1280

const screenHeight = 720

const dom = document.createElement("canvas")
dom.style.scale = (1 / window.devicePixelRatio).toString()

if (typeof globalThis.print !== "undefined") {
  globalThis.print = console.log
}

function getColor(s: string) {
  const regex = /\\c&(.*?)&/
  const match = s.match(regex)
  if (match) {
    const matchedNumber = match[1]
    return matchedNumber
  }
  return undefined
}

function getFontName(s: string) {
  const regex = /\\fn([^\\]+)/
  const match = s.match(regex)
  if (match) {
    const matchedNumber = match[1]
    return matchedNumber
  }
  return undefined
}
function getPos(s: string) {
  const regex = /\\pos\((.*?)\)/
  const match = s.match(regex)
  if (match) {
    const matchedNumber = match[1]
    return matchedNumber
  }
  return undefined
}
function getFontSize(s: string) {
  const regex = /\\fs(\d+)/
  const match = s.match(regex)
  if (match) {
    const matchedNumber = +match[1]
    return matchedNumber
  }
  return undefined
}

function getBorderSize(s: string) {
  const regex = /\\bord(\d+)/
  const match = s.match(regex)
  if (match) {
    const matchedNumber = +match[1]
    return matchedNumber
  }
  return undefined
}

function drawAssToCanvas(ctx: CanvasRenderingContext2D, s: string) {
  const regex = /\{([^}]+)\}/g
  const matches = s.match(regex)
  let _color
  let _fontName
  let _fontSize
  let _pos
  let _borderSize
  if (matches) {
    for (const match of matches) {
      const innerContent = match.substring(1, match.length - 1)
      console.log("innerContent:", innerContent)
      const color = getColor(innerContent)
      const fontName = getFontName(innerContent)
      const fontSize = getFontSize(innerContent)
      const pos = getPos(innerContent)
      const borderSize = getBorderSize(innerContent)

      if (color !== undefined) {
        console.log("color: ", color)
        // console.log("data: ", innerContent, { color, fontName, fontSize, pos, borderSize })
        ctx.fillStyle = `#${color}`
        _color = color
      }
      if (fontName !== undefined) {
        console.log("fontName: ", fontName)
        ctx.font = fontName
        _fontName = fontName
      }
      if (pos !== undefined) {
        const [x, y] = pos.split(",").map((i) => +i)
        console.log("pos: ", x, y)
        ctx.moveTo(x, y)
        _pos = { x, y }
      }
      if (fontSize !== undefined) {
        console.log("fontSize: ", fontSize)
        _fontSize = fontSize
      }
      if (borderSize !== undefined) {
        console.log("borderSize: ", borderSize)
        _borderSize = borderSize
      }
    }
  }
  console.log("text: ", { _pos, _color, _fontName, _fontSize, _borderSize })

  const path = s.split("}").at(-1)?.trim() || ""
  if (path) {
    if (path.startsWith("m ")) {
      const list = path.split(" ")
      let index = 0
      ctx.beginPath()
      while (index < list.length) {
        const cmd = list[index]
        const x = +list[index + 1]
        const y = +list[index + 2]
        index += 3
        console.log("cmd,", cmd, x, y)
        switch (cmd) {
          case "m": {
            ctx.moveTo(x, y)
            break
          }
          case "l": {
            ctx.lineTo(x, y)
            break
          }
          case "s": {
            ctx.fill()
            ctx.closePath();
            break
          }
        }
      }
    } else {
      console.log("text: ", { _pos, _color, _fontName, _fontSize, _borderSize })
      ctx.fillStyle = `#${_color}` // 设置填充颜色
      ctx.font = `${_fontSize}px ${_fontName}` // 字体大小为 30 像素，类型为 Arial
      ctx.fillText(path, _pos?.x ?? 0, (_pos?.y ?? 0) + (_fontSize ?? 0))
    }
  }
}

const fps = 30
export function createMPV(
  canvas: HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
) {
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const eventMap: Record<string, any[]> = {
    MOUSE_BTN0: [] as ((e: KeyEvent) => void)[],
    "mouse-pos": [] as ((e: MousePos) => void)[],
  }

  canvas.addEventListener(
    "mousedown",
    throttle(() => {
      const mpvEvent = {
        event: "down",
        is_mouse: true,
        key_name: "MBTN_LEFT",
      } as const
      // console.log(mpvEvent)
      for (const fn of eventMap["MOUSE_BTN0"]) {
        fn(mpvEvent)
      }
    }, 1 / fps),
  )

  canvas.addEventListener(
    "mouseup",
    throttle(() => {
      const mpvEvent = {
        event: "up",
        is_mouse: true,
        key_name: "MBTN_LEFT",
      } as const
      // console.log(mpvEvent)
      for (const fn of eventMap["MOUSE_BTN0"]) {
        fn(mpvEvent)
      }
    }, 1 / fps),
  )

  canvas.addEventListener(
    "mousemove",
    throttle((e: MouseEvent) => {
      const pos: MousePos = {
        x: e.offsetX,
        y: e.offsetY,
        hover: true,
      }
      // console.log(pos)
      for (const fn of eventMap["mouse-pos"]) {
        fn(pos)
      }
    }, 1 / fps),
  )

  const ctx = canvas.getContext("2d")!
  const props: Record<string, any> = {
    // hack
    canvas: canvas,

    path: "/mpv/video/mock.mp4",
    "user-path": "/mpv",
    "script-name": "mock.js",
    "script-file": "/mpv/portable_config/scripts/mock.js",
    cwd: "/mpv/portable_config/scripts",
    width: canvasWidth,
    height: canvasHeight,
    pid: 1234,
    "osd-height": canvasHeight,
    "osd-width": canvasWidth,
    mute: false,
    pause: false,
    "mouse-pos": {
      x: 0,
      y: 0,
      hover: true,
    },
    "osd-dimensions": {
      w: canvasWidth,
      h: canvasHeight,
    },
    "track-list/count": 0,
    fullscreen: false,
    volume: 100,
    speed: 1,
    aid: 0,
    vid: 0,
    sid: 0,
  }
  const mp: MPV = {
    command: function (command: string): true | undefined {
      console.log("cmd: ", command)
      return true
    },
    commandv: function (...args: readonly string[]): true | undefined {
      console.log("cmd: ", ...args)
      return true
    },
    command_native: function (table: unknown, def?: unknown): unknown {
      console.log("command_native: ")
      return true
    },
    command_native_async: function (
      table: unknown,
      fn?:
        | ((
          success: boolean,
          result: unknown,
          error: string | undefined,
        ) => void)
        | undefined,
    ): unknown {
      console.log("command_native_async: ")
      return true
    },
    abort_async_command: function (t: unknown): void {
      console.log("Function not implemented.")
    },
    get_property: function (name: string, def: string): string {
      console.log("get_property: ", name, def)
      return props[name]
    },
    get_property_osd: function (
      name: string,
      def?: string | undefined,
    ): string {
      console.log("get_property_osd: ", name, def)
      return props[name]
    },
    get_property_bool: function (name: string, def: boolean): boolean {
      console.log("get_property_bool", name, def)
      return !!props[name]
    },
    get_property_number: function (name: string, def: number): number {
      console.log("get_property_number", name, def)
      return +props[name]
    },
    get_property_native: function <T = unknown, Def = unknown>(
      name: string,
      def?: Def | undefined,
    ): T {
      console.log("get_property_native", name, def)
      return props[name]
    },
    get_property_string: function (
      name: string,
      def?: unknown,
    ): string | undefined {
      console.log("get_property_string", name, def)
      return props[name]
    },
    set_property: function (name: string, value: string): true | undefined {
      console.log("set_property:", name, value)
      props[name] = value
      return true
    },
    set_property_bool: function (
      name: string,
      value: boolean,
    ): true | undefined {
      console.log("set_property_bool:", name, value)
      props[name] = value
      return true
    },
    set_property_number: function (
      name: string,
      value: number,
    ): true | undefined {
      console.log("set_property_number:", name, value)
      props[name] = value
      return true
    },
    set_property_native: function (
      name: string,
      value: unknown,
    ): true | undefined {
      console.log("set_property_native:", name, value)
      props[name] = value
      return true
    },
    set_property_string: function (
      name: string,
      value: unknown,
    ): true | undefined {
      console.log("set_property_string:", name, value)
      props[name] = value
      return true
    },
    get_time: function (): number {
      return +new Date()
    },
    set_osd_ass: function (
      res_x: number,
      res_y: number,
      data: string,
    ): unknown {
      console.log("set_osd_ass not implemented.")
      return true
    },
    get_osd_margins: function (): OSDMargins | undefined {
      console.log("get_osd_margins not implemented.")
      return undefined
    },
    get_mouse_pos: function (): MousePos {
      console.log("get_mouse_pos not implemented.")
      return props["mouse-pos"]
    },
    add_key_binding: function (
      key: string,
      name?: string | undefined,
      fn?: ((event: KeyEvent) => void) | undefined,
      flags?: AddKeyBindingFlags | undefined,
    ): void {
      console.log("add_key_binding not implemented.")
      if (eventMap[key]) {
        eventMap[key].push(fn)
      } else {
        eventMap[key] = [fn]
      }
    },
    add_forced_key_binding: function (
      key: string,
      name?: string | undefined,
      fn?: ((event: KeyEvent) => void) | undefined,
      flags?: AddKeyBindingFlags | undefined,
    ): void {
      console.log("add_key_binding not implemented.")
    },
    remove_key_binding: function (name: string): void {
      console.log("remove_key_binding not implemented.")
    },
    register_event: function (
      name: string,
      fn: (event: Record<string, unknown>) => void,
    ): void {
      console.log("register_event not implemented.")
    },
    unregister_event: function (fn: (...args: unknown[]) => void): void {
      console.log("unregister_event not implemented.")
    },
    // observe_property: function (name: string, type: "native", fn: (name: string, value: unknown) => void): void {
    //   console.log("Function not implemented.")
    // },
    // unobserve_property: function (fn: (...args: unknown[]) => void): void {
    //   console.log("Function not implemented.")
    // },
    get_opt: function (key: string): string {
      console.log("get_opt not implemented.")
      return ""
    },
    get_script_name: function (): string {
      console.log("get_script_name not implemented.")
      return props["script-name"]
    },
    osd_message: function (text: string, duration?: number | undefined): void {
      console.log("osd_message: ", text, duration)
    },
    register_idle: function (fn: () => void): void {
      console.log("register_idle not implemented.")
    },
    unregister_idle: function (fn: () => void): void {
      console.log("unregister_idle not implemented.")
    },
    enable_messages: function (level: LogLevel): void {
      console.log("enable_messages not implemented.")
    },
    register_script_message: function (
      name: string,
      fn: (...args: unknown[]) => void,
    ): void {
      console.log("register_script_message not implemented.")
    },
    unregister_script_message: function (name: string): void {
      console.log("unregister_script_message not implemented.")
    },
    create_osd_overlay: function (format: "ass-events"): MpvOsdOverlay {
      return {
        data: "",
        res_x: 0,
        res_y: 720,
        z: 0,
        hidden: false,
        compute_bounds: false,
        update() {
          console.log("update", this.data)
          drawAssToCanvas(ctx, this.data)
          const pos = getPos(this.data)
          const text = (this.data.split("}").at(-1) ?? "").trim()
          let x0 = 0
          let y0 = 0
          let x1 = text.length * 100
          let y1 = text.length * 100
          if (!text.startsWith("m ") && pos !== undefined) {
            ;[x0, y0] = pos.split(",").map((i) => +i)
          }
          const coord = {
            x0,
            y0,
            x1,
            y1,
          }

          console.log("update coord: ", this.data, coord)
          return coord
        },
        remove() {
          console.log("remove", this.data)
        },
      }
    },
    get_osd_size: function (): OSDSize | undefined {
      return { width: canvasWidth, height: canvasWidth, aspect: 1 }
    },
    add_hook: function (name: string, priority: number, fn: () => void): void {
      console.log("add_hook not implemented.")
    },
    last_error: function (): string {
      console.log("last_error not implemented.")
      return ""
    },
    get_time_ms: function (): number {
      return +new Date()
    },
    get_script_file: function (): string {
      return props["script-file"]
    },
    module_paths: [],
    msg: {
      log: function (level: LogLevel, ...msg: unknown[]): void {
        console.log("log: ", level, msg)
      },
      fatal: function (...msg: unknown[]): void {
        console.log("fatal: ", msg)
      },
      error: function (...msg: unknown[]): void {
        console.log("error: ", msg)
      },
      warn: function (...msg: unknown[]): void {
        console.log("warn: ", msg)
      },
      info: function (...msg: unknown[]): void {
        console.log("info: ", msg)
      },
      verbose: function (...msg: unknown[]): void {
        console.log("verbose: ", msg)
      },
      debug: function (...msg: unknown[]): void {
        console.log("debug: ", msg)
      },
      trace: function (...msg: unknown[]): void {
        console.log("trace: ", msg)
      },
    },
    options: {
      read_options: function (
        table: Record<string, string | number | boolean>,
        identifier?: string | undefined,
        on_update?:
          | ((list: Record<string, boolean | undefined>) => void)
          | undefined,
      ): void {
        console.log("read_options not implemented.")
      },
    },
    utils: {
      getcwd: function (): string | undefined {
        return props.cwd
      },
      readdir: function (
        path: string,
        filter?: "files" | "dirs" | "normal" | "all" | undefined,
      ): string[] | undefined {
        console.log("readdir not implemented.")
        return []
      },
      file_info: function (path: string): FileInfo | undefined {
        console.log("file_info not implemented.")
        return undefined
      },
      split_path: function (path: string): [string, string] {
        console.log("split_path not implemented.")
        const list = path.split("/")
        return [list.slice(0, -1).join("/"), list.at(-1) || ""]
      },
      join_path: function (p1: string, p2: string): string {
        return p1 + "/" + p2
      },
      getpid: function (): number {
        return props.pid
      },
      getenv: function (name: string): string | undefined {
        console.log("getenv not implemented.")
        return undefined
      },
      get_user_path: function (path: string): string {
        console.log("get_user_path not implemented.")
        return props["get-user-path"]
      },
      read_file: function (fname: string, max?: number | undefined): string {
        console.log("read_file not implemented.")
        return ""
      },
      write_file: function (fname: string, str: string): void {
        console.log("write_file not implemented.")
      },
      compile_js: function (
        fname: string,
        content_str: string,
      ): (...args: unknown[]) => unknown {
        console.log("compile_js not implemented.")
        return () => { }
      },
    },
    // @ts-ignore
    observe_property: function (
      name: string,
      type: "native",
      fn: (name: string, value: unknown) => void,
    ): void {
      // console.log("observe_property: ", name, type)
      fn(name, props[name])
      if (eventMap[name]) {
        eventMap[name].push((v: any) => {
          // console.log('observe_property1', name, v)
          fn(name, v)
        })
      } else {
        eventMap[name] = [
          (v: any) => {
            // console.log('observe_property2', name, v)
            fn(name, v)
          },
        ]
      }
    },
  }

  return mp
}

globalThis.mp = createMPV(dom, screenWidth, screenHeight)
