export function ignore(): true | undefined {
  return mp.commandv("ignore")
}

export function seek(
  ...args: [
    target?: number,
    flags?:
      | "relative"
      | "-"
      | "absolute-percent"
      | "absolute"
      | "relative-percent"
      | "keyframes"
      | "exact"
      | (string & {}),
    legacy?: "unused" | "default-precise" | "keyframes" | "exact",
  ]
): true | undefined {
  return mp.commandv("seek", ...args)
}

export function revertSeek(
  ...args: [flags?: "mark" | "mark-permanent" | (string & {})]
): true | undefined {
  return mp.commandv("revert-seek", ...args)
}

export function quit(...args: [code?: number]): true | undefined {
  return mp.commandv("quit", ...args)
}

export function quitWatchLater(...args: [code?: number]): true | undefined {
  return mp.commandv("quit-watch-later", ...args)
}

export function stop(
  ...args: [flags?: "keep-playlist" | (string & {})]
): true | undefined {
  return mp.commandv("stop", ...args)
}

export function frameStep(): true | undefined {
  return mp.commandv("frame-step")
}

export function frameBackStep(): true | undefined {
  return mp.commandv("frame-back-step")
}

export function playlistNext(
  ...args: [flags?: "weak" | "force"]
): true | undefined {
  return mp.commandv("playlist-next", ...args)
}

export function playlistPrev(
  ...args: [flags?: "weak" | "force"]
): true | undefined {
  return mp.commandv("playlist-prev", ...args)
}

export function playlistNextPlaylist(): true | undefined {
  return mp.commandv("playlist-next-playlist")
}

export function playlistPrevPlaylist(): true | undefined {
  return mp.commandv("playlist-prev-playlist")
}

export function playlistPlayIndex(
  ...args: [index?: "current" | "none" | number]
): true | undefined {
  return mp.commandv("playlist-play-index", ...args)
}

export function playlistShuffle(): true | undefined {
  return mp.commandv("playlist-shuffle")
}

export function playlistUnshuffle(): true | undefined {
  return mp.commandv("playlist-unshuffle")
}

export function subStep(
  ...args: [skip?: number, flags?: "primary" | "secondary"]
): true | undefined {
  return mp.commandv("sub-step", ...args)
}

export function subSeek(
  ...args: [skip?: number, flags?: "primary" | "secondary"]
): true | undefined {
  return mp.commandv("sub-seek", ...args)
}

export function printText(...args: [text?: string]): true | undefined {
  return mp.commandv("print-text", ...args)
}

export function showText(
  ...args: [text?: string, duration?: number, level?: number]
): true | undefined {
  return mp.commandv("show-text", ...args)
}

export function expandText(...args: [text?: string]): string {
  return mp.command_native<string>(["expand-text", ...args])
}

export function expandPath(...args: [text?: string]): string {
  return mp.command_native<string>(["expand-path", ...args])
}

export function normalizePath(...args: [filename?: string]): string {
  return mp.command_native<string>(["normalize-path", ...args])
}

export function escapeAss(...args: [text?: string]): string {
  return mp.command_native<string>(["escape-ass", ...args])
}

export function showProgress(): true | undefined {
  return mp.commandv("show-progress")
}

export function subAdd(
  ...args: [
    url?: string,
    flags?: "select" | "auto" | "cached",
    title?: string,
    lang?: string,
  ]
): true | undefined {
  return mp.commandv("sub-add", ...args)
}

export function audioAdd(
  ...args: [
    url?: string,
    flags?: "select" | "auto" | "cached",
    title?: string,
    lang?: string,
  ]
): true | undefined {
  return mp.commandv("audio-add", ...args)
}

export function videoAdd(
  ...args: [
    url?: string,
    flags?: "select" | "auto" | "cached",
    title?: string,
    lang?: string,
    albumart?: boolean,
  ]
): true | undefined {
  return mp.commandv("video-add", ...args)
}

export function subRemove(...args: [id?: number]): true | undefined {
  return mp.commandv("sub-remove", ...args)
}

export function audioRemove(...args: [id?: number]): true | undefined {
  return mp.commandv("audio-remove", ...args)
}

export function videoRemove(...args: [id?: number]): true | undefined {
  return mp.commandv("video-remove", ...args)
}

export function subReload(...args: [id?: number]): true | undefined {
  return mp.commandv("sub-reload", ...args)
}

export function audioReload(...args: [id?: number]): true | undefined {
  return mp.commandv("audio-reload", ...args)
}

export function videoReload(...args: [id?: number]): true | undefined {
  return mp.commandv("video-reload", ...args)
}

export function rescanExternalFiles(
  ...args: [flags?: "keep-selection" | "reselect"]
): true | undefined {
  return mp.commandv("rescan-external-files", ...args)
}

export function screenshot(
  ...args: [
    flags?:
      | "video"
      | "-"
      | "window"
      | "subtitles"
      | "each-frame"
      | (string & {}),
    legacy?: "unused" | "single" | "each-frame",
  ]
): true | undefined {
  return mp.commandv("screenshot", ...args)
}

export function screenshotToFile(
  ...args: [filename?: string, flags?: "video" | "window" | "subtitles"]
): true | undefined {
  return mp.commandv("screenshot-to-file", ...args)
}

export function screenshotRaw(
  ...args: [
    flags?: "video" | "window" | "subtitles",
    format?: "bgr0" | "bgra" | "rgba" | "rgba64",
  ]
): true | undefined {
  return mp.commandv("screenshot-raw", ...args)
}

export function loadfile(
  ...args: [
    url?: string,
    flags?:
      | "replace"
      | "append"
      | "append-play"
      | "insert-next"
      | "insert-next-play"
      | "insert-at"
      | "insert-at-play",
    index?: number,
    options?: object,
  ]
): true | undefined {
  return mp.commandv("loadfile", ...args)
}

export function loadlist(
  ...args: [
    url?: string,
    flags?:
      | "replace"
      | "append"
      | "append-play"
      | "insert-next"
      | "insert-next-play"
      | "insert-at"
      | "insert-at-play",
    index?: number,
  ]
): true | undefined {
  return mp.commandv("loadlist", ...args)
}

export function playlistClear(): true | undefined {
  return mp.commandv("playlist-clear")
}

export function playlistRemove(
  ...args: [index?: "current" | number]
): true | undefined {
  return mp.commandv("playlist-remove", ...args)
}

export function playlistMove(
  ...args: [index1?: number, index2?: number]
): true | undefined {
  return mp.commandv("playlist-move", ...args)
}

export function run(
  ...args: [command?: string, ...args: string[]]
): true | undefined {
  return mp.commandv("run", ...args)
}

export function subprocess(
  ...args: [
    args?: string,
    playback_only?: boolean,
    capture_size?: number,
    capture_stdout?: boolean,
    capture_stderr?: boolean,
    detach?: boolean,
    env?: string,
    stdin_data?: string,
    passthrough_stdin?: boolean,
  ]
): true | undefined {
  return mp.commandv("subprocess", ...args)
}

export function set(
  ...args: [name?: string, value?: string]
): true | undefined {
  return mp.commandv("set", ...args)
}

export function del(...args: [name?: string]): true | undefined {
  return mp.commandv("del", ...args)
}

export type ChangeListOperation =
  | "set"
  | "append"
  | "add"
  | "pre"
  | "clr"
  | "remove"
  | "toggle"
  | "help"

export function changeList(
  ...args: [name?: string, operation?: ChangeListOperation, value?: string]
): true | undefined {
  return mp.commandv("change-list", ...args)
}

export function add(
  ...args: [name?: string, value?: number]
): true | undefined {
  return mp.commandv("add", ...args)
}

export function cycle(
  ...args: [name?: string, value?: boolean]
): true | undefined {
  return mp.commandv("cycle", ...args)
}

export function multiply(
  ...args: [name?: string, value?: number]
): true | undefined {
  return mp.commandv("multiply", ...args)
}

export function cycleValues(
  ...args: [arg0?: string, arg1?: string, ...argN: string[]]
): true | undefined {
  return mp.commandv("cycle-values", ...args)
}

export function enableSection(
  ...args: [
    name?: string,
    flags?:
      | "default"
      | "exclusive"
      | "allow-hide-cursor"
      | "allow-vo-dragging"
      | (string & {}),
  ]
): true | undefined {
  return mp.commandv("enable-section", ...args)
}

export function disableSection(...args: [name?: string]): true | undefined {
  return mp.commandv("disable-section", ...args)
}

export function defineSection(
  ...args: [name?: string, contents?: string, flags?: "default" | "force"]
): true | undefined {
  return mp.commandv("define-section", ...args)
}

export function abLoop(): true | undefined {
  return mp.commandv("ab-loop")
}

export function dropBuffers(): true | undefined {
  return mp.commandv("drop-buffers")
}

export function af(
  ...args: [operation?: string, value?: string]
): true | undefined {
  return mp.commandv("af", ...args)
}

export function vf(
  ...args: [operation?: string, value?: string]
): true | undefined {
  return mp.commandv("vf", ...args)
}

export function afCommand(
  ...args: [
    label?: string,
    command?: string,
    argument?: string,
    target?: string,
  ]
): true | undefined {
  return mp.commandv("af-command", ...args)
}

export function vfCommand(
  ...args: [
    label?: string,
    command?: string,
    argument?: string,
    target?: string,
  ]
): true | undefined {
  return mp.commandv("vf-command", ...args)
}

export function aoReload(): true | undefined {
  return mp.commandv("ao-reload")
}

export function scriptBinding(
  ...args: [name?: string, arg?: string]
): true | undefined {
  return mp.commandv("script-binding", ...args)
}

export function scriptMessage(...args: [...args: string[]]): true | undefined {
  return mp.commandv("script-message", ...args)
}

export function scriptMessageTo(
  ...args: [target?: string, ...args: string[]]
): true | undefined {
  return mp.commandv("script-message-to", ...args)
}

export function overlayAdd(
  ...args: [
    id?: number,
    x?: number,
    y?: number,
    file?: string,
    offset?: number,
    fmt?: string,
    w?: number,
    h?: number,
    stride?: number,
    dw?: number,
    dh?: number,
  ]
): true | undefined {
  return mp.commandv("overlay-add", ...args)
}

export function overlayRemove(...args: [id?: number]): true | undefined {
  return mp.commandv("overlay-remove", ...args)
}

export function osdOverlay(
  ...args: [
    id?: number,
    format?: "none" | "ass-events",
    data?: string,
    res_x?: number,
    res_y?: number,
    z?: number,
    hidden?: boolean,
    compute_bounds?: boolean,
  ]
): true | undefined {
  return mp.commandv("osd-overlay", ...args)
}

export function writeWatchLaterConfig(): true | undefined {
  return mp.commandv("write-watch-later-config")
}

export function deleteWatchLaterConfig(
  ...args: [filename?: string]
): true | undefined {
  return mp.commandv("delete-watch-later-config", ...args)
}

export function mouse(
  ...args: [x?: number, y?: number, button?: number, mode?: "single" | "double"]
): true | undefined {
  return mp.commandv("mouse", ...args)
}

export function keybind(
  ...args: [name?: string, cmd?: string, comment?: string]
): true | undefined {
  return mp.commandv("keybind", ...args)
}

export function keypress(
  ...args: [name?: string, scale?: number]
): true | undefined {
  return mp.commandv("keypress", ...args)
}

export function keydown(...args: [name?: string]): true | undefined {
  return mp.commandv("keydown", ...args)
}

export function keyup(...args: [name?: string]): true | undefined {
  return mp.commandv("keyup", ...args)
}

export function applyProfile(
  ...args: [name?: string, mode?: "apply" | "restore"]
): true | undefined {
  return mp.commandv("apply-profile", ...args)
}

export function loadConfigFile(...args: [filename?: string]): true | undefined {
  return mp.commandv("load-config-file", ...args)
}

export function loadInputConf(...args: [filename?: string]): true | undefined {
  return mp.commandv("load-input-conf", ...args)
}

export function loadScript(...args: [filename?: string]): true | undefined {
  return mp.commandv("load-script", ...args)
}

export function dumpCache(
  ...args: [start?: number, end?: number, filename?: string]
): true | undefined {
  return mp.commandv("dump-cache", ...args)
}

export function abLoopDumpCache(
  ...args: [filename?: string]
): true | undefined {
  return mp.commandv("ab-loop-dump-cache", ...args)
}

export function abLoopAlignCache(): true | undefined {
  return mp.commandv("ab-loop-align-cache")
}

export function beginVoDragging(): true | undefined {
  return mp.commandv("begin-vo-dragging")
}

export function contextMenu(): true | undefined {
  return mp.commandv("context-menu")
}

export function flushStatusLine(...args: [clear?: boolean]): true | undefined {
  return mp.commandv("flush-status-line", ...args)
}

export function notifyProperty(...args: [property?: string]): true | undefined {
  return mp.commandv("notify-property", ...args)
}
