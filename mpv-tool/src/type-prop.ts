export const PunctuationKeys = [
  "!",
  "@",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "-",
  "_",
  "=",
  "+",
  "[",
  "]",
  "{",
  "}",
  "\\",
  "|",
  ";",
  ":",
  '"',
  ",",
  ".",
  "<",
  ">",
  "/",
  "?",
  "`",
  "~",
] as const
export const CtrlKeys = ["ESC", "ENTER", "BS", "SPACE"] as const
export const NumberKeys = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
] as const
export const AlphabetKeys = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const

export type NumberKey = (typeof NumberKeys)[number]
export type CtrlKey = (typeof CtrlKeys)[number]
export type PunctuationKey = (typeof PunctuationKeys)[number]
export type AlphabetKey = (typeof AlphabetKeys)[number]

export type TrackType = "video" | "audio" | "image" | "sub" | (string & {})
export type TrackItem = {
  title?: string
  lang?: string
  albumart: boolean
  codec: "h264" | (string & {})
  "decoder-desc": string
  default: boolean
  "demux-fps": number
  "demux-h": number
  "demux-par": number
  "demux-w": number
  dependent: boolean
  external: boolean
  "ff-index": number
  forced: boolean
  "hearing-impaired": boolean
  id: number
  image: boolean
  "main-selection": number
  selected: boolean
  "src-id": number
  type: TrackType
  "visual-impaired": boolean
  "external-filename"?: string
}
export type MousePos = {
  // mouse in video or toolbar
  hover: boolean
  x: number
  y: number
}
export type Geometry = {
  w: number
  h: number
  x: number
  y: number
}

export type StringProp =
  | "mpv-configuration"
  | "term-clip-cc"
  | "osd-ass-cc/0"
  | "osd-ass-cc/1"
  | "osd-sym-cc"
  | "hwdec-interop"
  | "colormatrix-primaries"
  | "colormatrix-gamma"
  | "current-ao"
  | "secondary-sub-text"
  | "sub-text"
  | "clock"
  | "current-demuxer"
  | "file-format"
  | "stream-open-filename"
  | "stream-path"
  | "media-title"
  | "filename"
  | "path"
  | "mpv-version"
  | "ffmpeg-version"
  | "sub-ass-extradata"
  | "working-directory"
  | "playlist-path"
  | "clipboard/text"
  | "video-codec"
  | "audio-codec"
export type NumberProp =
  | "video-aspect-override"
  | "container-fps"
  | "edition-list/count"
  | "video"
  | "audio"
  | "sub"
  | "playback-time"
  | "playback-time/full"
  | "touch-pos/count"
  | "estimated-frame-count"
  | "estimated-frame-number"
  | "playlist-count"
  | "playlist-pos"
  | "playlist-pos-1"
  | "time-remaining"
  | "time-remaining/full"
  | "audio-pts"
  | "audio-pts/full"
  | "playtime-remaining"
  | "playtime-remaining/full"
  | "remaining-file-loops"
  | "remaining-ab-loops"
  | "chapter"
  | "edition"
  | "current-edition"
  | "chapters"
  | "editions"
  | "cache-buffering-state"
  | "playlist-current-pos"
  | "playlist-playing-pos"
  | "volume"
  | "volume-gain"
  | "ao-volume"
  | "audio-delay"
  | "aid"
  | "vid"
  | "sid"
  | "sub-start"
  | "sub-start/full"
  | "secondary-sub-start"
  | "secondary-sub-start/full"
  | "sub-end"
  | "secondary-sub-end"
  | "sub-end/full"
  | "secondary-sub-end/full"
  | "time-pos"
  | "time-start"
  | "percent-pos"
  | "vo-delayed-frame-count"
  | "frame-drop-count"
  | "decoder-frame-drop-count"
  | "display-height"
  | "display-width"
  | "mistimed-frame-count"
  | "duration"
  | "stream-end"
  | "pitch"
  | "speed"
  | "pid"
  | "audio-speed-correction"
  | "video-speed-correction"
  | "file-size"
  | "stream-pos"
  | "avsync"
  | "total-avsync-change"
  | "vsync-ratio"
  | "cache-speed"
  | "demuxer-cache-duration"
  | "demuxer-cache-time"
  | "demuxer-start-time"
  | "window-id"
  | "current-window-scale"
  | "estimated-vf-fps"
  | "vf"
  | "video-bitrate"
  | "audio-bitrate"
  | "sub-bitrate"
  | "display-fps"
  | "estimated-display-fps"
  | "vsync-jitter"
  | "display-hidpi-scale"
  | "libass-version"
  | "ab-loop-a"
  | "ab-loop-b"
  | "sid"
  | "secondary-sid"
  | "sub-delay"
  | "secondary-sub-delay"
  | "sub-speed"
  | "sub-pos"
  | "secondary-sub-pos"
  | "dwidth"
  | "dheight"
  | "width"
  | "height"
  | "osd-width"
  | "osd-height"
  | "osd-par"
  | "osd-dimensions/osd-par"
export type BoolProp =
  | "hwdec-current"
  | "vo-configured"
  | "ao-mute"
  | "mixer-active"
  | "idle-active"
  | "deinterlace-active"
  | "partially-seekable"
  | "seekable"
  | "demuxer-via-network"
  | "paused-for-cache"
  | "demuxer-cache-idle"
  | "playback-abort"
  | "seeking"
  | "eof-reached"
  | "core-idle"
  | "display-sync-active"
  | "focused"

export type Metadata = {
  compatible_brands: "mp42mp41isomavc1" | (string & {})
  creation_time: string
  major_brand: "mp42" | (string & {})
  minor_version: string
}

export type ChapterMetadata = {
  title: string
}

export type VfMetadata = {}
export type AfMetadata = {}
export type Chapter = {
  title: number
  count: number
  time: number
}
export type DemuxerCacheState = {
  "bof-cached": boolean
  "cache-duration": number
  "cache-end": number
  "debug-byte-level-seeks": number
  "debug-low-level-seeks": number
  "debug-ts-last": number
  eof: boolean
  "eof-cached": boolean
  "fw-bytes": number
  idle: boolean
  "raw-input-rate": number
  "reader-pts": number
  "seekable-ranges": number[]
  "total-bytes": number
  "ts-per-stream": {
    "cache-duration": number
    "cache-end": number
    "reader-pts": number
    type: TrackType
  }[]
  underrun: boolean
}

export type Protocol =
  | "avdevice"
  | "av"
  | "file"
  | "dvd"
  | "dvdnav"
  | "file"
  | "bd"
  | "br"
  | "bluray"
  | "bdnav"
  | "brnav"
  | "bluraynav"
  | "archive"
  | "memory"
  | "hex"
  | "null"
  | "mf"
  | "edl"
  | "file"
  | "appending"
  | "slice"
  | "fd"
  | "fdclose"
  | "data"
  | "gopher"
  | "gophers"
  | "http"
  | "dav"
  | "webdav"
  | "httpproxy"
  | "https"
  | "davs"
  | "webdavs"
  | "mmsh"
  | "mms"
  | "mmshttp"
  | "mmst"
  | "rtmp"
  | "rtmpe"
  | "rtmps"
  | "rtmpt"
  | "rtmpte"
  | "rtmpts"
  | "rtp"
  | "srtp"
  | "srt"
  | "ipfs"
  | "ipns"
  | "rtsp"
  | "rtsps"
  | "async"
  | "cache"
  | "concat"
  | "concatf"
  | "crypto"
  | "fd"
  | "ffrtmpcrypt"
  | "ffrtmphttp"
  | "file"
  | "ftp"
  | "hls"
  | "pipe"
  | "subfile"
  | "tcp"
  | "tls"
  | "udp"
  | "udplite"
  | "sftp"
  | "ffmpeg"
  | "lavf"
  | (string & {})

export type Platform = "windows" | "darwin" | "linux" | "android" | "freebsd"

export type TermSize = {
  w: number
  h: number
}
export type OsdDimensions = {
  w: number
  h: number
  aspect: number
  mb: number
  ml: number
  mr: number
  mt: number
  par: number
}
export type Clipboard = {
  text: string
}

export type TouchPos = {
  x: number
  y: number
  id: number
}

export type VideoFormat = "h264" | (string & {})

export type AudioCodecName = "dts" | (string & {})

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface UserData {}

export type Menu = {
  type: string
  title: string
  cmd: string
  shortcut: string
  state: string[]
  submenu: Menu[]
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
  par: number | null
  pixelformat: string
  primaries: string
  rotate: number
  sar: number
  "sar-name": string
  "sig-peak": number
  "stereo-in": string
  w: number
}

export type VideoTargetParams = {
  alpha: string
  aspect: number
  "aspect-name": string
  "chroma-location": string
  colorlevels: Colorlevels
  colormatrix: Colormatrix
  dh: number
  dw: number
  gamma: string
  h: number
  light: string
  "max-cll": number
  "max-fall": number
  "max-luma": number
  "min-luma": number
  par: null | number
  pixelformat: string
  primaries: string
  rotate: number
  sar: number
  "sar-name": string
  "sig-peak": number
  "stereo-in": string
  w: number
}

export type Colormatrix = "bt.709" | "rgb" | (string & {})
export type Colorlevels = "limited" | "full" | (string & {})
export type Edition = {
  default: boolean
  id: number
  title: string
}

export type PlaylistItem = {
  filename: string
  current: boolean
  playing: boolean
  title: string
  id: number
  "playlist-path": string
}
export type StereoIn = "mono" | (string & {})
export type AudioParamsFormat = "s32p" | "float" | (string & {})
export type AudioParams = {
  "channel-count": number
  channels: string
  format: AudioParamsFormat
  "hr-channels": string
  samplerate: number
}
export type AudioDeviceName = "auto" | "sdl" | "openal" | (string & {})
export type AudioDevice = { description: string; name: AudioDeviceName }
export type VideoDecParams = {
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
  "stereo-in": StereoIn
  w: number
}

export type VideoFrameInfo = {
  interlaced: boolean
  "picture-type": string
  repeat: boolean
  "smpte-timecode": string
  tff: boolean
}

export type VoPassRedraw = {
  avg: number
  count: number
  desc: string
  last: number
  peak: number
  samples: number[]
}

export type VoPassFresh = {
  avg: number
  count: number
  desc: string
  last: number
  peak: number
  samples: number[]
}

export type VoPasses = {
  fresh: VoPassFresh[]
  redraw: VoPassRedraw[]
}

export type PerfInfo = { name: string; text: string; value: number }[]
export type Vo = "gpu-next" | "gpu" | (string & {})
export type GpuContext = "d3d11" | (string & {})
export type OsdAssCc = { 0: string; 1: string }
export type Af = string[]

export type Decoder = { codec: string; description: string; driver: string }[]
export type Encoder = {
  codec: string
  description: string
  driver: string
}[]
export const InputKeyList = [
  "SPACE",
  "SHARP",
  "IDEOGRAPHIC_SPACE",
  "ENTER",
  "TAB",
  "BS",
  "DEL",
  "INS",
  "HOME",
  "END",
  "PGUP",
  "PGDWN",
  "ESC",
  "PRINT",
  "RIGHT",
  "LEFT",
  "DOWN",
  "UP",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "F13",
  "F14",
  "F15",
  "F16",
  "F17",
  "F18",
  "F19",
  "F20",
  "F21",
  "F22",
  "F23",
  "F24",
  "KP0",
  "KP1",
  "KP2",
  "KP3",
  "KP4",
  "KP5",
  "KP6",
  "KP7",
  "KP8",
  "KP9",
  "KP_DEL",
  "KP_DEC",
  "KP_INS",
  "KP_HOME",
  "KP_END",
  "KP_PGUP",
  "KP_PGDWN",
  "KP_RIGHT",
  "KP_BEGIN",
  "KP_LEFT",
  "KP_DOWN",
  "KP_UP",
  "KP_ENTER",
  "KP_ADD",
  "KP_SUBTRACT",
  "KP_MULTIPLY",
  "KP_DIVIDE",
  "MBTN_LEFT",
  "MBTN_MID",
  "MBTN_RIGHT",
  "WHEEL_UP",
  "WHEEL_DOWN",
  "WHEEL_LEFT",
  "WHEEL_RIGHT",
  "MBTN_BACK",
  "MBTN_FORWARD",
  "MBTN9",
  "MBTN10",
  "MBTN11",
  "MBTN12",
  "MBTN13",
  "MBTN14",
  "MBTN15",
  "MBTN16",
  "MBTN17",
  "MBTN18",
  "MBTN19",
  "MBTN_LEFT_DBL",
  "MBTN_MID_DBL",
  "MBTN_RIGHT_DBL",
  "GAMEPAD_ACTION_DOWN",
  "GAMEPAD_ACTION_RIGHT",
  "GAMEPAD_ACTION_LEFT",
  "GAMEPAD_ACTION_UP",
  "GAMEPAD_BACK",
  "GAMEPAD_MENU",
  "GAMEPAD_START",
  "GAMEPAD_LEFT_SHOULDER",
  "GAMEPAD_RIGHT_SHOULDER",
  "GAMEPAD_LEFT_TRIGGER",
  "GAMEPAD_RIGHT_TRIGGER",
  "GAMEPAD_LEFT_STICK",
  "GAMEPAD_RIGHT_STICK",
  "GAMEPAD_DPAD_UP",
  "GAMEPAD_DPAD_DOWN",
  "GAMEPAD_DPAD_LEFT",
  "GAMEPAD_DPAD_RIGHT",
  "GAMEPAD_LEFT_STICK_UP",
  "GAMEPAD_LEFT_STICK_DOWN",
  "GAMEPAD_LEFT_STICK_LEFT",
  "GAMEPAD_LEFT_STICK_RIGHT",
  "GAMEPAD_RIGHT_STICK_UP",
  "GAMEPAD_RIGHT_STICK_DOWN",
  "GAMEPAD_RIGHT_STICK_LEFT",
  "GAMEPAD_RIGHT_STICK_RIGHT",
  "POWER",
  "MENU",
  "PLAY",
  "PAUSE",
  "PLAYPAUSE",
  "STOP",
  "FORWARD",
  "REWIND",
  "NEXT",
  "PREV",
  "VOLUME_UP",
  "VOLUME_DOWN",
  "MUTE",
  "HOMEPAGE",
  "WWW",
  "MAIL",
  "FAVORITES",
  "SEARCH",
  "SLEEP",
  "CANCEL",
  "RECORD",
  "CHANNEL_UP",
  "CHANNEL_DOWN",
  "PLAYONLY",
  "PAUSEONLY",
  "GO_BACK",
  "GO_FORWARD",
  "TOOLS",
  "ZOOMIN",
  "ZOOMOUT",
  "XF86_PAUSE",
  "XF86_STOP",
  "XF86_PREV",
  "XF86_NEXT",
  "MOUSE_BTN0",
  "MOUSE_BTN1",
  "MOUSE_BTN2",
  "MOUSE_BTN3",
  "MOUSE_BTN4",
  "MOUSE_BTN5",
  "MOUSE_BTN6",
  "MOUSE_BTN7",
  "MOUSE_BTN8",
  "MOUSE_BTN9",
  "MOUSE_BTN10",
  "MOUSE_BTN11",
  "MOUSE_BTN12",
  "MOUSE_BTN13",
  "MOUSE_BTN14",
  "MOUSE_BTN15",
  "MOUSE_BTN16",
  "MOUSE_BTN17",
  "MOUSE_BTN18",
  "MOUSE_BTN19",
  "MOUSE_BTN0_DBL",
  "MOUSE_BTN1_DBL",
  "MOUSE_BTN2_DBL",
  "AXIS_UP",
  "AXIS_DOWN",
  "AXIS_LEFT",
  "AXIS_RIGHT",
  "CLOSE_WIN",
  "MOUSE_MOVE",
  "MOUSE_LEAVE",
  "MOUSE_ENTER",
  "UNMAPPED",
  "ANY_UNICODE",
] as const

export type InputKey = keyof typeof InputKeyList

export type InputKeyBinding =
  | NumberKey
  | CtrlKey
  | PunctuationKey
  | AlphabetKey
  | InputKey

export type OptionInfo = Record<
  string,
  {
    name: string
    type: string | number
    "set-from-commandline": boolean
    "set-locally": boolean
    "expects-file": boolean
    "default-value": string
    min: number
    choices: number
  }
>

export type ProfileOption = { key: string; value: string }
export type Profile = {
  name: string
  options: ProfileOption[]
}
export type CommandArgType =
  | "Time"
  | "Flags"
  | "Choice"
  | "Integer"
  | "String"
  | "Flag"
  | "Key/value list"
  | "String list"
  | "ByteSize"
  | "Double"
  | "up|down"
  | "Integer64"
export type CommandArg = {
  name: string
  optional: boolean
  type: CommandArgType
}

export type Command = { args: CommandArg[]; name: string; vararg: boolean }

export type InputBinding = {
  cmd: string
  comment: string
  is_weak: boolean
  key: InputKey
  priority: number
  section: string
}

export type Prop = {
  metadata: Metadata
  "filtered-metadata": Metadata
  "chapter-metadata": ChapterMetadata
  "vf-metadata": VfMetadata
  "af-metadata": AfMetadata
  "demuxer-cache-state": DemuxerCacheState
  "chapter-list": Chapter[]
  "display-names": string[]
  "protocol-list": Protocol[]
  platform: Platform
  "osd-dimensions": OsdDimensions
  "term-size": TermSize
  clipboard: Clipboard
  "mouse-pos": MousePos
  "touch-pos": TouchPos[]
  "video-format": VideoFormat
  "audio-codec-name": AudioCodecName
  "user-data": UserData
  "menu-data": Menu[]
  colormatrix: Colormatrix
  "colormatrix-input-range": Colorlevels
  "video-params": VideoParams
  "video-target-params": VideoTargetParams
  "video-out-params": VideoParams
  "track-list": TrackItem[]
  "current-tracks": {
    video: TrackItem
    audio: TrackItem
    sub: TrackItem
    sub2: TrackItem
  }
  "edition-list": Edition[]
  playlist: PlaylistItem[]
  "audio-params": AudioParams
  "audio-out-params": AudioParams
  "audio-device": AudioDeviceName
  "audio-device-list": AudioDevice[]
  "video-dec-params": VideoDecParams
  "video-frame-info": VideoFrameInfo
  "vo-passes": VoPasses
  "perf-info": PerfInfo
  "current-vo": Vo
  "current-gpu-context": GpuContext
  "osd-ass-cc": OsdAssCc
  af: Af
  "decoder-list": Decoder
  "encoder-list": Encoder
  "demuxer-lavf-list": string[]
  "input-key-list": InputKey
  options: string[]
  "file-local-options": string[]
  "option-info": OptionInfo
  "property-list": string[]
  "profile-list": Profile[]
  "command-list": Command[]
  "input-bindings": InputBinding[]
} & {
  [key in StringProp]: string
} & {
  [key in NumberProp]: number
} & {
  [key in BoolProp]: boolean
}
