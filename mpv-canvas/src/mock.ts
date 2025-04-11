import type {
  AddKeyBindingFlags,
  CommandResult,
  FileInfo,
  KeyEvent,
  LogLevel,
  MP,
  MousePos,
  MpvOsdOverlay,
  OSDMargins,
  OSDSize,
} from "@mpv-easy/tool"
import throttle from "lodash-es/throttle"
import * as fabric from "fabric" // browser
import { Bgra, Bgr } from "e-color"
const { Canvas, Rect, FabricText } = fabric

function getColor(s: string) {
  const regex = /\\c&(.*?)&/
  const color = s.match(regex)?.[1]
  if (color) {
    const hex = new Bgr(Number.parseInt(color, 16)).toHex()
    return hex
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
    const matchedNumber = match[1] || ""
    return matchedNumber?.split(",").map((i) => +i)
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

function getAlpha(s: string) {
  const regex = /\\alpha&H([0-9A-Fa-f]{2})/
  const match = s.match(regex)
  if (match) {
    const alpha = match[1]
    const revertAlpha = (255 - Number.parseInt(alpha ?? "FF", 16))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase()

    return revertAlpha
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

function isRectNode(s: string): boolean {
  return !!s.split("}").at(-1)?.startsWith(" m ")
}

function assToRect(s: string) {
  const list =
    (s.split("}").at(-1) ?? "")
      .trim()
      .split(" ")
      .map((i) => +i) || []

  if (list.length === 16) {
    // rectCw
    const [_, x, y, __, x1, y1, ___, x2, y2] = list
    const width = x1 - x
    const height = y2 - y
    const rect = {
      x,
      y,
      width,
      height,
      rx: 0,
      ry: 0,
      stroke: "#00000000",
      strokeWidth: 0,
    }

    return rect
  }

  if (list.length === 44) {
    // roundRectCw
    const x = list[1]
    const y = list[2]
    const x1 = list[4]
    const y1 = list[5]
    const bx1 = list[7]
    const by1 = list[8]

    const x3 = list[14]
    const y4 = list[15]

    const by2 = list[18]

    const c = 0.551915024494
    const rx = (bx1 - x1) / c
    const ry = (by2 - y4) / c
    const width = x3 - x1
    const height = y4 - y1
    const rect = {
      x: x - rx,
      y: y,
      width,
      height,
      rx,
      ry,
      stroke: "#00000000",
      strokeWidth: 0,
    }
    return rect
  }

  if (list.length === 48) {
    // roundRectCw with border
    const x = list[1]
    const y = list[2]
    const x1 = list[4]
    const y1 = list[5]

    const bx1 = list[7]
    const by1 = list[8]

    const x3 = list[14]
    const y4 = list[15]

    const by2 = list[18]
    const by3 = list[20]

    const c = 0.551915024494
    const strokeWidth = by1 - y1
    const width = x1 - x - 1 * strokeWidth
    const height = by3 - y - 1 * strokeWidth
    const rect = {
      x: x,
      y: y,
      width,
      height,
      rx: 0,
      ry: 0,
      stroke: getColor(s) ?? "00000000",
      strokeWidth,
    }
    return rect
  }
  // console.error("not support rect: " + s)
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rx: 0,
    ry: 0,
    stroke: "00000000",
    strokeWidth: 0,
  }
}
function assToDom(s: string) {
  const regex = /\{([^}]+)\}/g
  const matches = s.match(regex)
  let _color
  let _fontName
  let _fontSize
  let _pos
  let _borderSize
  let _alpha

  if (matches) {
    for (const match of matches) {
      const innerContent = match.substring(1, match.length - 1)
      const color = getColor(innerContent)
      const fontName = getFontName(innerContent)
      const fontSize = getFontSize(innerContent)
      const pos = getPos(innerContent)
      const borderSize = getBorderSize(innerContent)
      const alpha = getAlpha(innerContent)

      if (color !== undefined) {
        _color = color
      }
      if (fontName !== undefined) {
        _fontName = fontName
      }
      if (pos !== undefined) {
        _pos = pos
      }
      if (fontSize !== undefined) {
        _fontSize = fontSize
      }
      if (borderSize !== undefined) {
        _borderSize = borderSize
      }
      if (alpha !== undefined) {
        _alpha = alpha
      }
    }
  }

  const rect = assToRect(s)

  const posX = _pos?.[0] ?? 0
  const posY = _pos?.[1] ?? 0
  return {
    color: _color,
    borderSize: _borderSize,
    fontSize: _fontSize,
    x: posX,
    y: posY,
    fontName: _fontName,
    text: getText(s),
    isRect: isRectNode(s),
    rect: {
      x: posX + rect.x,
      y: posY + rect.y,
      width: rect.width,
      height: rect.height,
      rx: rect.rx,
      ry: rect.ry,
      stroke: isRectNode(s) ? rect.stroke : "00000000",
      strokeWidth: isRectNode(s) ? rect.strokeWidth : 0,
    },
    alpha: _alpha ?? "FF",
  }
}

function getText(s: string) {
  return s.split("}").at(-1) ?? ""
}

let zindex = 0
function createOsdOverlay(
  fabricCanvas: fabric.Canvas,
): MpvOsdOverlay & { fabricNode: any } {
  if (typeof globalThis.print !== "undefined") {
    globalThis.print = console.log
  }

  return {
    data: "",
    res_x: 0,
    res_y: 720,
    z: 0,
    hidden: false,
    compute_bounds: false,
    fabricNode: undefined,
    update() {
      const dom = assToDom(this.data)
      const { fontSize } = dom

      const color = new Bgra(`${dom.color}${this.hidden ? "00" : dom.alpha}`)
        .toRgba()
        .toHex("#")
      if (dom.isRect) {
        if (!this.fabricNode) {
          this.fabricNode = new Rect({
            top: dom.rect.y,
            left: dom.rect.x,
            width: dom.rect.width,
            height: dom.rect.height,
            fill: dom.rect.strokeWidth ? "#00000000" : color,
            selectable: false,
            rx: dom.rect.rx,
            ry: dom.rect.ry,
            stroke: dom.rect.stroke,
            strokeWidth: dom.rect.strokeWidth,
          })
          fabricCanvas.add(this.fabricNode)
          this.z = zindex++
        }
        this.fabricNode.set("width", dom.rect.width)
        this.fabricNode.set("height", dom.rect.height)
        this.fabricNode.set("left", dom.rect.x)
        this.fabricNode.set("top", dom.rect.y)
        this.fabricNode.set("rx", dom.rect.rx)
        this.fabricNode.set("ry", dom.rect.ry)
        this.fabricNode.set("fill", dom.rect.strokeWidth ? "#00000000" : color)
        this.fabricNode.set("stroke", dom.rect.stroke)
        this.fabricNode.set("strokeWidth", dom.rect.strokeWidth)
        fabricCanvas.moveObjectTo(this.fabricNode, zindex - this.z)
        if (dom.fontName) {
          this.fabricNode.set("fontFamily", dom.fontName)
        }
        if (dom.fontSize) {
          this.fabricNode.set("fontSize", dom.fontSize)
        }

        return {
          x0: dom.rect.x,
          y0: dom.rect.y,
          x1: dom.rect.x + dom.rect.width,
          y1: dom.rect.y + dom.rect.height,
        }
      }
      if (!this.fabricNode) {
        this.fabricNode = new FabricText(getText(this.data), {
          left: dom.x,
          top: dom.y,
          fontSize: fontSize,
          fill: color,
          selectable: false,
        })
        fabricCanvas.add(this.fabricNode)
        if (dom.fontName) {
          this.fabricNode.set("fontFamily", dom.fontName)
        }

        if (dom.fontName) {
          this.fabricNode.set("fontFamily", dom.fontName)
        }
        if (dom.fontSize) {
          this.fabricNode.set("fontSize", dom.fontSize)
        }
      } else {
        this.fabricNode.set("left", dom.x)
        this.fabricNode.set("top", dom.y)
        this.fabricNode.set("fill", color)
        this.fabricNode.set("fontSize", fontSize)
        this.fabricNode.set("text", dom.text)

        if (dom.fontName) {
          this.fabricNode.set("fontFamily", dom.fontName)
        }
        if (dom.fontSize) {
          this.fabricNode.set("fontSize", dom.fontSize)
        }
      }
      const x0 = 0
      const y0 = 0
      const x1 = x0 + this.fabricNode.width
      const y1 = y0 + this.fabricNode.height
      const coord = {
        x0,
        y0,
        x1,
        y1,
      }
      return coord
    },
    remove() {
      if (this.fabricNode) {
        fabricCanvas.remove(this.fabricNode)
        this.fabricNode = undefined
      }
    },
  }
}

export function createMpvMock(
  canvas: HTMLCanvasElement,
  screenWidth: number,
  screenHeight: number,
  fps = 30,
) {
  const frameTime = 1000 / fps
  canvas.width = screenWidth
  canvas.height = screenHeight

  const dom = document.createElement("canvas")
  dom.setAttribute("id", "mpv-canvas")
  dom.width = screenWidth
  dom.height = screenHeight
  dom.style.width = `${screenWidth}px`
  dom.style.height = `${screenHeight}px`
  document.body.append(dom)

  const fabricCanvas = new Canvas(dom, {
    width: screenWidth,
    height: screenHeight,
    fireRightClick: true,
    fireMiddleClick: true,
    stopContextMenu: true,
    hoverCursor: "default",
    selection: false,
  })

  dom.style.left = ""
  dom.style.top = ""

  const eventMap: Record<string, any[]> = {
    MOUSE_BTN0: [] as ((e: KeyEvent) => void)[],
    MOUSE_BTN3: [] as ((e: KeyEvent) => void)[],
    MOUSE_BTN4: [] as ((e: KeyEvent) => void)[],
    "mouse-pos": [] as ((e: MousePos) => void)[],
  }

  document.addEventListener(
    "keydown",
    throttle((e) => {
      const key = e.key
      const mpvEvent = {
        key,
      }
      for (const fn of eventMap[key] || []) {
        fn(mpvEvent)
      }
    }, frameTime),
  )

  fabricCanvas.on(
    "mouse:wheel",
    throttle((e: fabric.TPointerEventInfo<WheelEvent>) => {
      if (e.e.deltaY > 0) {
        const mpvEvent = {
          event: "down",
          is_mouse: true,
          key_name: "WHEEL_DOWN",
        } as const
        for (const fn of eventMap.MOUSE_BTN4 || []) {
          fn(mpvEvent)
        }
      } else {
        const mpvEvent = {
          event: "down",
          is_mouse: true,
          key_name: "WHEEL_UP",
        } as const
        for (const fn of eventMap.MOUSE_BTN4 || []) {
          fn(mpvEvent)
        }
      }
    }, frameTime),
  )

  // FIXME: https://github.com/fabricjs/fabric.js/issues/10510
  fabricCanvas.on(
    "mouse:down",
    throttle((event: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
      const e = event.e as MouseEvent
      switch (e.button) {
        case 1: {
          const mpvEvent = {
            event: "down",
            is_mouse: true,
            key_name: "MBTN_LEFT",
          } as const
          for (const fn of eventMap.MOUSE_BTN0 || []) {
            fn(mpvEvent)
          }
          return
        }
        case 3: {
          const mpvEvent = {
            event: "down",
            is_mouse: true,
            key_name: "MBTN_RIGHT",
          } as const
          for (const fn of eventMap.MOUSE_BTN2 || []) {
            fn(mpvEvent)
          }
          return
        }
      }
    }, frameTime),
  )
  fabricCanvas.on(
    "mouse:out",
    throttle(({ e }: fabric.TPointerEventInfo<MouseEvent>) => {
      const pos: MousePos = {
        x: e.offsetX,
        y: e.offsetY,
        hover: false,
      }
      for (const fn of eventMap["mouse-pos"] || []) {
        fn(pos)
      }
    }, frameTime),
  )

  fabricCanvas.on(
    "mouse:up",
    throttle((event: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
      const e = event.e as MouseEvent
      switch (e.button) {
        case 1: {
          const mpvEvent = {
            event: "up",
            is_mouse: true,
            key_name: "MBTN_LEFT",
          } as const
          for (const fn of eventMap.MOUSE_BTN0 || []) {
            fn(mpvEvent)
          }
          return
        }
        case 3: {
          const mpvEvent = {
            event: "up",
            is_mouse: true,
            key_name: "MBTN_RIGHT",
          } as const
          for (const fn of eventMap.MOUSE_BTN2 || []) {
            fn(mpvEvent)
          }
          return
        }
      }
    }, frameTime),
  )

  fabricCanvas.on(
    "mouse:move",
    // fabric hack
    throttle(({ e }: fabric.TPointerEventInfo<MouseEvent>) => {
      const pos: MousePos = {
        x: e.offsetX,
        y: e.offsetY,
        hover: true,
      }
      // // console.log(pos, e)
      for (const fn of eventMap["mouse-pos"] || []) {
        fn(pos)
      }
    }, frameTime),
  )

  const props: Record<string, any> = {
    path: "/mpv/video/mock.mp4",
    "user-path": "/mpv",
    "script-name": "mock.js",
    "script-file": "/mpv/portable_config/scripts/mock.js",
    cwd: "/mpv/portable_config/scripts",
    width: screenWidth,
    height: screenHeight,
    pid: 1234,
    "osd-height": screenHeight,
    "osd-width": screenWidth,
    mute: false,
    pause: false,
    "mouse-pos": {
      x: -1,
      y: -1,
      hover: false,
    },
    "osd-dimensions": {
      w: screenWidth,
      h: screenHeight,
    },
    "track-list/count": 0,
    fullscreen: false,
    volume: 100,
    "volume-max": 130,
    speed: 1,
    duration: 60 * 66,
    "time-pos": 0,
    "window-maximized": false,

    aid: 0,
    vid: 0,
    sid: 0,
    "video-params": {},
    "time-pos/full": 0,
    "playlist/count": 1,
  }
  const mp: MP & { renderAll: () => void } = {
    command: (command: string): true | undefined => {
      // console.log("cmd: ", command)
      return true
    },
    commandv: (...args: readonly string[]): true | undefined => {
      // console.log("cmd: ", ...args)
      return true
    },
    command_native: <T = CommandResult>(table: unknown, def?: unknown): T => {
      // console.log("command_native: ")
      return {
        status: 0,
        stderr: "",
        stdout: "",
        error_string: "",
        killed_by_us: false,
      } as T
    },
    command_native_async: <T = CommandResult>(
      table: {
        name: string
        args?: string[]
        playback_only?: boolean
        capture_stdout?: boolean
        capture_stderr?: boolean
      },
      fn?:
        | ((success: boolean, result: T, error: string | undefined) => void)
        | undefined,
    ): number => {
      // console.log("command_native_async: ")
      return 0
    },
    abort_async_command: (t: number): void => {
      // console.log("Function not implemented.")
    },
    get_property: (name: string, def?: string): string => {
      // console.log("get_property: ", name, def)
      return props[name] ?? def
    },
    get_property_osd: (name: string, def?: string | undefined): string => {
      // console.log("get_property_osd: ", name, def)
      return props[name] ?? def
    },
    get_property_bool: (name: string, def?: boolean): boolean => {
      // console.log("get_property_bool", name, def)
      return props[name] ?? def
    },
    get_property_number: (name: string, def?: number): number => {
      // console.log("get_property_number", name, def)
      return props[name] ?? def
    },
    get_property_native: <T = unknown, Def = unknown>(
      name: string,
      def?: Def | undefined,
    ): T => {
      // console.log("get_property_native", name, def)
      return props[name]
    },
    get_property_string: (name: string, def?: string): string => {
      // console.log("get_property_string", name, def)
      return props[name] ?? def
    },
    set_property: (name: string, value: string): true | undefined => {
      // console.log("set_property:", name, value)
      if (props[name] !== value) {
        props[name] = value

        for (const fn of eventMap[name] || []) {
          fn(value)
        }
      }
      return true
    },
    set_property_bool: (name: string, value: boolean): true | undefined => {
      // console.log("set_property_bool:", name, value)
      if (props[name] !== value) {
        props[name] = value

        for (const fn of eventMap[name] || []) {
          fn(value)
        }
      }
      return true
    },
    set_property_number: (name: string, value: number): true | undefined => {
      // console.log("set_property_number:", name, value)
      if (props[name] !== value) {
        props[name] = value

        for (const fn of eventMap[name] || []) {
          fn(value)
        }
      }
      return true
    },
    set_property_native: (name: string, value: unknown): true | undefined => {
      // console.log("set_property_native:", name, value)
      if (props[name] !== value) {
        props[name] = value

        for (const fn of eventMap[name] || []) {
          fn(value)
        }
      }
      return true
    },
    set_property_string: (name: string, value: unknown): true | undefined => {
      // console.log("set_property_string:", name, value)
      if (props[name] !== value) {
        props[name] = value

        for (const fn of eventMap[name] || []) {
          fn(value)
        }
      }
      return true
    },
    get_time: (): number => Date.now(),
    set_osd_ass: (res_x: number, res_y: number, data: string): unknown => {
      // console.log("set_osd_ass not implemented.")
      return true
    },
    get_osd_margins: (): OSDMargins | undefined => {
      // console.log("get_osd_margins not implemented.")
      return undefined
    },
    get_mouse_pos: (): MousePos => {
      // console.log("get_mouse_pos not implemented.")
      return props["mouse-pos"]
    },
    add_key_binding: (
      key: string,
      name?: string | undefined,
      fn?: ((event: KeyEvent) => void) | undefined,
      flags?: AddKeyBindingFlags | undefined,
    ): void => {
      // console.log("add_key_binding not implemented.")
      if (eventMap[key]) {
        eventMap[key].push(fn)
      } else {
        eventMap[key] = [fn]
      }
    },
    add_forced_key_binding: (
      key: string,
      name?: string | undefined,
      fn?: ((event: KeyEvent) => void) | undefined,
      flags?: AddKeyBindingFlags | undefined,
    ): void => {
      // console.log("add_key_binding not implemented.")
      if (eventMap[key]) {
        eventMap[key].push(fn)
      } else {
        eventMap[key] = [fn]
      }
    },
    remove_key_binding: (name: string): void => {
      // console.log("remove_key_binding not implemented.")
    },
    register_event: (
      name: string,
      fn: (event: Record<string, unknown>) => void,
    ): void => {
      // console.log("register_event not implemented.")
    },
    unregister_event: (fn: (...args: unknown[]) => void): void => {
      // console.log("unregister_event not implemented.")
    },
    // observe_property: function (name: string, type: "native", fn: (name: string, value: unknown) => void): void {
    //   // console.log("Function not implemented.")
    // },
    // unobserve_property: function (fn: (...args: unknown[]) => void): void {
    //   // console.log("Function not implemented.")
    // },
    get_opt: (key: string): string => {
      // console.log("get_opt not implemented.")
      return ""
    },
    get_script_name: (): string => {
      // console.log("get_script_name not implemented.")
      return props["script-name"]
    },
    osd_message: (text: string, duration?: number | undefined): void => {
      // console.log("osd_message: ", text, duration)
    },
    register_idle: (fn: () => void): void => {
      // console.log("register_idle not implemented.")
    },
    unregister_idle: (fn: () => void): void => {
      // console.log("unregister_idle not implemented.")
    },
    enable_messages: (level: LogLevel): void => {
      // console.log("enable_messages not implemented.")
    },
    register_script_message: (
      name: string,
      fn: (...args: string[]) => void,
    ): void => {
      // console.log("register_script_message not implemented.")
    },
    unregister_script_message: (name: string): void => {
      // console.log("unregister_script_message not implemented.")
    },
    create_osd_overlay: (format: "ass-events"): MpvOsdOverlay => {
      // const fabricNode = new Rect({
      //   left: 50,
      //   top: 50,
      //   width: 100,
      //   height: 50,
      //   fill: 'red'
      // })
      // fabricCanvas.add(fabricNode);

      return createOsdOverlay(fabricCanvas)
    },
    get_osd_size: (): OSDSize | undefined => ({
      width: screenWidth,
      height: screenHeight,
      aspect: 1,
    }),
    add_hook: (name: string, priority: number, fn: () => void): void => {
      // console.log("add_hook not implemented.")
    },
    last_error: (): string => {
      // console.log("last_error not implemented.")
      return ""
    },
    get_time_ms: (): number => Date.now(),
    get_script_file: (): string => props["script-file"],
    module_paths: [],
    msg: {
      log: (level: LogLevel, ...msg: unknown[]): void => {
        // console.log("log: ", level, msg)
      },
      fatal: (...msg: unknown[]): void => {
        // console.log("fatal: ", msg)
      },
      error: (...msg: unknown[]): void => {
        // console.log("error: ", msg)
      },
      warn: (...msg: unknown[]): void => {
        // console.log("warn: ", msg)
      },
      info: (...msg: unknown[]): void => {
        // console.log("info: ", msg)
      },
      verbose: (...msg: unknown[]): void => {
        // console.log("verbose: ", msg)
      },
      debug: (...msg: unknown[]): void => {
        // console.log("debug: ", msg)
      },
      trace: (...msg: unknown[]): void => {
        // console.log("trace: ", msg)
      },
    },
    options: {
      read_options: (
        table: Record<string, string | number | boolean>,
        identifier?: string | undefined,
        on_update?:
          | ((list: Record<string, boolean | undefined>) => void)
          | undefined,
      ): void => {
        // console.log("read_options not implemented.")
      },
    },
    utils: {
      getcwd: (): string | undefined => props.cwd,
      readdir: (
        path: string,
        filter?: "files" | "dirs" | "normal" | "all" | undefined,
      ): string[] | undefined => {
        // console.log("readdir not implemented.")
        return []
      },
      file_info: (path: string): FileInfo | undefined => {
        // console.log("file_info not implemented.")
        return undefined
      },
      split_path: (path: string): [string, string] => {
        // console.log("split_path not implemented.")
        const list = path?.split?.("/") ?? []
        return [list.slice(0, -1).join("/"), list.at(-1) || ""]
      },
      join_path: (p1: string, p2: string): string => `${p1}/${p2}`,
      getpid: (): number => props.pid,
      getenv: (name: string): string | undefined => {
        // console.log("getenv not implemented.")
        return undefined
      },
      get_user_path: (path: string): string => {
        // console.log("get_user_path not implemented.")
        return props["get-user-path"]
      },
      read_file: (fname: string, max?: number | undefined): string => {
        // console.log("read_file not implemented.")
        return ""
      },
      write_file: (fname: string, str: string): void => {
        // console.log("write_file not implemented.")
      },
      compile_js: (
        fname: string,
        content_str: string,
      ): ((...args: unknown[]) => unknown) => {
        // console.log("compile_js not implemented.")
        return () => {}
      },
    },
    // @ts-ignore
    observe_property: (
      name: string,
      type: "native",
      fn: (name: string, value: unknown) => void,
    ): void => {
      // // console.log("observe_property: ", name, type)
      fn(name, props[name])
      if (eventMap[name]) {
        eventMap[name].push((v: any) => {
          // // console.log('observe_property1', name, v)
          fn(name, v)
        })
      } else {
        eventMap[name] = [
          (v: any) => {
            // // console.log('observe_property2', name, v)
            fn(name, v)
          },
        ]
      }
    },
    renderAll() {
      fabricCanvas.renderAll()
    },
  }

  return mp
}
