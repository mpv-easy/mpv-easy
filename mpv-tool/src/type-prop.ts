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
  | "hwdec"
  | "include"
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
  | "audio-codec-name"
  | "audio-device"
  | "video-format"
  | "current-vo"
  | "current-gpu-context"
  | "hwdec-current"
  | "sub-text-ass"
  | "ab-loop-a"
  | "ab-loop-b"
  | "platform"
  | "colormatrix"
  | "colormatrix-input-range"
  | "dump-stats"
  | "log-file"
  | "media-controls"
  | "config-dir"
  | "ytdl-format"
  | "load-auto-profiles"
  | "frames"
  | "start"
  | "end"
  | "length"
  | "play-direction"
  | "ab-loop-count"
  | "playlist-start"
  | "lavfi-complex"
  | "audio-display"
  | "hls-bitrate"
  | "demuxer"
  | "audio-demuxer"
  | "sub-demuxer"
  | "audio-channels"
  | "audio-format"
  | "sub-auto"
  | "cover-art-auto"
  | "gapless-audio"
  | "title"
  | "force-media-title"
  | "osd-on-seek"
  | "framedrop"
  | "stream-dump"
  | "watch-later-dir"
  | "watch-later-directory"
  | "ordered-chapters-files"
  | "chapters-file"
  | "hr-seek"
  | "term-osd"
  | "term-osd-bar-chars"
  | "term-title"
  | "term-playing-msg"
  | "osd-playing-msg"
  | "term-status-msg"
  | "osd-status-msg"
  | "osd-msg1"
  | "osd-msg2"
  | "osd-msg3"
  | "osd-playlist-entry"
  | "input-ipc-server"
  | "input-ipc-client"
  | "screenshot-template"
  | "screenshot-dir"
  | "screenshot-directory"
  | "play-dir"
  | "dvd-device"
  | "bluray-device"
  | "user-agent"
  | "referrer"
  | "cookies-file"
  | "tls-ca-file"
  | "tls-cert-file"
  | "tls-key-file"
  | "http-proxy"
  | "deinterlace-field-parity"
  | "ad"
  | "vd"
  | "audio-spdif"
  | "video-aspect-method"
  | "vd-lavc-film-grain"
  | "vd-lavc-skiploopfilter"
  | "vd-lavc-skipidct"
  | "vd-lavc-skipframe"
  | "vd-lavc-framedrop"
  | "vd-lavc-dr"
  | "hwdec-codecs"
  | "hwdec-image-format"
  | "demuxer-lavf-probe-info"
  | "demuxer-lavf-format"
  | "sub-codepage"
  | "rtsp-transport"
  | "demuxer-lavf-linearize-timestamps"
  | "demuxer-rawaudio-channels"
  | "demuxer-rawaudio-format"
  | "demuxer-rawvideo-format"
  | "demuxer-rawvideo-mp-format"
  | "demuxer-rawvideo-codec"
  | "directory-mode"
  | "demuxer-mkv-subtitle-preroll"
  | "sub-ass-vsfilter-color-compat"
  | "sub-ass-use-video-data"
  | "sub-ass-styles"
  | "sub-hinting"
  | "sub-ass-hinting"
  | "sub-shaper"
  | "sub-ass-shaper"
  | "sub-font"
  | "sub-color"
  | "sub-outline-color"
  | "sub-back-color"
  | "sub-border-color"
  | "sub-shadow-color"
  | "sub-border-style"
  | "sub-align-x"
  | "sub-align-y"
  | "sub-justify"
  | "sub-font-provider"
  | "sub-fonts-dir"
  | "sub-ass-override"
  | "secondary-sub-ass-override"
  | "sub-filter-sdh-enclosures"
  | "osd-selected-color"
  | "osd-selected-outline-color"
  | "osd-font"
  | "osd-color"
  | "osd-outline-color"
  | "osd-back-color"
  | "osd-border-color"
  | "osd-shadow-color"
  | "osd-border-style"
  | "osd-align-x"
  | "osd-align-y"
  | "osd-justify"
  | "osd-font-provider"
  | "osd-fonts-dir"
  | "osd-bar-marker-style"
  | "audio-client-name"
  | "wasapi-exclusive-buffer"
  | "ao-null-channel-layouts"
  | "ao-null-format"
  | "ao-pcm-file"
  | "video-output-levels"
  | "screenshot-format"
  | "screenshot-avif-encoder"
  | "screenshot-avif-pixfmt"
  | "input-conf"
  | "drag-and-drop"
  | "ontop-level"
  | "geometry"
  | "autofit"
  | "autofit-larger"
  | "autofit-smaller"
  | "focus-on"
  | "x11-name"
  | "wayland-app-id"
  | "video-crop"
  | "screen"
  | "screen-name"
  | "fs-screen"
  | "fs-screen-name"
  | "video-sync"
  | "backdrop-type"
  | "window-affinity"
  | "vo-mmcss-profile"
  | "window-corners"
  | "vo-direct3d-texture-memory"
  | "vo-image-outdir"
  | "vo-image-format"
  | "vo-image-avif-encoder"
  | "vo-image-avif-pixfmt"
  | "vo-tct-algo"
  | "vo-tct-buffering"
  | "cache"
  | "demuxer-seekable-cache"
  | "index"
  | "mf-type"
  | "stream-record"
  | "video-backward-overlap"
  | "audio-backward-overlap"
  | "metadata-codepage"
  | "demuxer-cache-dir"
  | "demuxer-cache-unlink-files"
  | "gpu-dumb-mode"
  | "target-prim"
  | "target-trc"
  | "target-peak"
  | "target-contrast"
  | "target-gamut"
  | "tone-mapping"
  | "tone-mapping-param"
  | "gamut-mapping-mode"
  | "hdr-compute-peak"
  | "scale"
  | "scale-param1"
  | "scale-param2"
  | "scale-wparam"
  | "dscale"
  | "dscale-param1"
  | "dscale-param2"
  | "dscale-wparam"
  | "cscale-param1"
  | "cscale-param2"
  | "cscale-wparam"
  | "tscale"
  | "tscale-param1"
  | "tscale-param2"
  | "tscale-wparam"
  | "fbo-format"
  | "dither-depth"
  | "dither"
  | "error-diffusion"
  | "background"
  | "background-color"
  | "gpu-shader-cache-dir"
  | "gpu-hwdec-interop"
  | "icc-profile"
  | "icc-cache-dir"
  | "icc-3dlut-size"
  | "border-background"
  | "lut"
  | "lut-type"
  | "image-lut"
  | "image-lut-type"
  | "target-lut"
  | "target-colorspace-hint"
  | "spirv-compiler"
  | "opengl-es"
  | "egl-output-format"
  | "vulkan-device"
  | "vulkan-swap-mode"
  | "d3d11-warp"
  | "d3d11-feature-level"
  | "d3d11-adapter"
  | "d3d11-output-format"
  | "d3d11-output-csp"
  | "angle-renderer"
  | "angle-d3d11-warp"
  | "angle-d3d11-feature-level"
  | "angle-egl-windowing"
  | "opengl-dwmflush"
  | "cuda-decode-device"
  | "vaapi-device"
  | "sws-scaler"
  | "zimg-scaler"
  | "zimg-scaler-param-a"
  | "zimg-scaler-param-b"
  | "zimg-scaler-chroma"
  | "zimg-scaler-chroma-param-a"
  | "zimg-scaler-chroma-param-b"
  | "zimg-dither"
  | "zimg-threads"
  | "o"
  | "of"
  | "ovc"
  | "oac"
export type NumberProp =
  | "ambient-light"
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
  | "image-display-duration"
  | "demuxer-termination-timeout"
  | "cache-pause-wait"
  | "mc"
  | "audio-samplerate"
  | "audio-wait-open"
  | "volume-max"
  | "volume-gain-max"
  | "volume-gain-min"
  | "replaygain-preamp"
  | "replaygain-fallback"
  | "cursor-autohide"
  | "osd-level"
  | "osd-duration"
  | "sstep"
  | "chapter-merge-threshold"
  | "chapter-seek-threshold"
  | "video-sync-max-video-change"
  | "video-sync-max-audio-change"
  | "video-sync-max-factor"
  | "hr-seek-demuxer-offset"
  | "autosync"
  | "osd-playing-msg-duration"
  | "dvd-speed"
  | "dvd-angle"
  | "network-timeout"
  | "container-fps-override"
  | "video-rotate"
  | "video-reversal-buffer"
  | "audio-reversal-buffer"
  | "vd-queue-max-secs"
  | "vd-queue-max-bytes"
  | "vd-queue-max-samples"
  | "ad-queue-max-secs"
  | "ad-queue-max-bytes"
  | "ad-queue-max-samples"
  | "vd-lavc-threads"
  | "vd-lavc-software-fallback"
  | "hwdec-extra-frames"
  | "ad-lavc-ac3drc"
  | "ad-lavc-threads"
  | "demuxer-lavf-probesize"
  | "demuxer-lavf-analyzeduration"
  | "demuxer-lavf-buffersize"
  | "demuxer-lavf-probescore"
  | "demuxer-rawaudio-rate"
  | "demuxer-rawvideo-w"
  | "demuxer-rawvideo-h"
  | "demuxer-rawvideo-fps"
  | "demuxer-rawvideo-size"
  | "demuxer-mkv-subtitle-preroll-secs"
  | "demuxer-mkv-subtitle-preroll-secs-index"
  | "sub-fps"
  | "sub-gauss"
  | "sub-scale"
  | "sub-line-spacing"
  | "sub-ass-line-spacing"
  | "sub-ass-video-aspect-override"
  | "sub-ass-prune-delay"
  | "teletext-page"
  | "sub-font-size"
  | "sub-outline-size"
  | "sub-border-size"
  | "sub-shadow-offset"
  | "sub-spacing"
  | "sub-margin-x"
  | "sub-margin-y"
  | "sub-blur"
  | "osd-scale"
  | "osd-font-size"
  | "osd-outline-size"
  | "osd-border-size"
  | "osd-shadow-offset"
  | "osd-spacing"
  | "osd-margin-x"
  | "osd-margin-y"
  | "osd-blur"
  | "osd-bar-align-x"
  | "osd-bar-align-y"
  | "osd-bar-w"
  | "osd-bar-h"
  | "osd-bar-outline-size"
  | "osd-bar-border-size"
  | "osd-bar-marker-scale"
  | "osd-bar-marker-min-size"
  | "audio-buffer"
  | "openal-num-buffers"
  | "openal-num-samples"
  | "sdl-buflen"
  | "ao-null-buffer"
  | "ao-null-outburst"
  | "ao-null-speed"
  | "ao-null-latency"
  | "brightness"
  | "saturation"
  | "contrast"
  | "hue"
  | "gamma"
  | "screenshot-jpeg-quality"
  | "screenshot-png-compression"
  | "screenshot-png-filter"
  | "screenshot-webp-quality"
  | "screenshot-webp-compression"
  | "screenshot-jxl-distance"
  | "screenshot-jxl-effort"
  | "audio-resample-filter-size"
  | "audio-resample-phase-shift"
  | "audio-resample-cutoff"
  | "audio-resample-max-output-size"
  | "input-ar-delay"
  | "input-ar-rate"
  | "input-doubleclick-time"
  | "input-key-fifo-size"
  | "input-dragging-deadzone"
  | "window-scale"
  | "monitoraspect"
  | "monitorpixelaspect"
  | "panscan"
  | "video-zoom"
  | "video-pan-x"
  | "video-pan-y"
  | "video-align-x"
  | "video-align-y"
  | "video-scale-x"
  | "video-scale-y"
  | "video-margin-ratio-left"
  | "video-margin-ratio-right"
  | "video-margin-ratio-top"
  | "video-margin-ratio-bottom"
  | "wid"
  | "display-fps-override"
  | "video-timing-offset"
  | "swapchain-depth"
  | "override-display-fps"
  | "vo-null-fps"
  | "vo-image-jpeg-quality"
  | "vo-image-png-compression"
  | "vo-image-png-filter"
  | "vo-image-webp-quality"
  | "vo-image-webp-compression"
  | "vo-image-jxl-distance"
  | "vo-image-jxl-effort"
  | "vo-tct-width"
  | "vo-tct-height"
  | "vo-kitty-width"
  | "vo-kitty-height"
  | "vo-kitty-top"
  | "vo-kitty-left"
  | "vo-kitty-rows"
  | "vo-kitty-cols"
  | "demuxer-readahead-secs"
  | "demuxer-hysteresis-secs"
  | "demuxer-max-bytes"
  | "demuxer-max-back-bytes"
  | "cache-secs"
  | "mf-fps"
  | "video-backward-batch"
  | "audio-backward-batch"
  | "demuxer-backward-playback-step"
  | "stream-buffer-size"
  | "gamma-factor"
  | "tone-mapping-max-boost"
  | "hdr-peak-percentile"
  | "hdr-peak-decay-rate"
  | "hdr-scene-threshold-low"
  | "hdr-scene-threshold-high"
  | "hdr-contrast-recovery"
  | "hdr-contrast-smoothness"
  | "scale-blur"
  | "scale-taper"
  | "scale-wtaper"
  | "scale-clamp"
  | "scale-radius"
  | "scale-antiring"
  | "scale-window"
  | "dscale-blur"
  | "dscale-taper"
  | "dscale-wtaper"
  | "dscale-clamp"
  | "dscale-radius"
  | "dscale-antiring"
  | "dscale-window"
  | "cscale"
  | "cscale-blur"
  | "cscale-taper"
  | "cscale-wtaper"
  | "cscale-clamp"
  | "cscale-radius"
  | "cscale-antiring"
  | "cscale-window"
  | "tscale-blur"
  | "tscale-taper"
  | "tscale-wtaper"
  | "tscale-clamp"
  | "tscale-radius"
  | "tscale-antiring"
  | "tscale-window"
  | "sigmoid-center"
  | "sigmoid-slope"
  | "dither-size-fruit"
  | "temporal-dither-period"
  | "interpolation-threshold"
  | "sharpen"
  | "gpu-tex-pad-x"
  | "gpu-tex-pad-y"
  | "deband-iterations"
  | "deband-threshold"
  | "deband-range"
  | "deband-grain"
  | "icc-intent"
  | "corner-rounding"
  | "opengl-swapinterval"
  | "opengl-check-pattern-a"
  | "opengl-check-pattern-b"
  | "egl-config-id"
  | "vulkan-queue-count"
  | "d3d11-sync-interval"
  | "sws-lgb"
  | "sws-cgb"
  | "sws-cvs"
  | "sws-chs"
  | "sws-ls"
  | "sws-cs"
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
  | "secondary-sid"
  | "sub-forced-only-cur"
  | "shuffle"
  | "quiet"
  | "really-quiet"
  | "terminal"
  | "msg-color"
  | "msg-module"
  | "msg-time"
  | "priority"
  | "config"
  | "load-scripts"
  | "js-memory-report"
  | "osc"
  | "ytdl"
  | "load-stats-overlay"
  | "load-console"
  | "load-osd-console"
  | "load-select"
  | "rebase-start-time"
  | "pause"
  | "keep-open"
  | "keep-open-pause"
  | "track-auto-selection"
  | "subs-with-matching-audio"
  | "subs-match-os-language"
  | "subs-fallback"
  | "subs-fallback-forced"
  | "demuxer-thread"
  | "demuxer-cache-wait"
  | "prefetch-playlist"
  | "cache-pause"
  | "cache-pause-initial"
  | "audio-pitch-correction"
  | "autoload-files"
  | "audio-file-auto"
  | "osd-bar"
  | "audio-exclusive"
  | "audio-fallback-to-null"
  | "audio-stream-silence"
  | "force-window"
  | "mute"
  | "replaygain"
  | "replaygain-clip"
  | "cursor-autohide-fs-only"
  | "stop-screensaver"
  | "use-filedir-conf"
  | "osd-fractions"
  | "video-latency-hacks"
  | "untimed"
  | "stop-playback-on-init-failure"
  | "loop-playlist"
  | "loop-file"
  | "loop"
  | "resume-playback"
  | "resume-playback-check-mtime"
  | "save-position-on-quit"
  | "write-filename-in-watch-later-config"
  | "ignore-path-in-watch-later-config"
  | "ordered-chapters"
  | "merge-files"
  | "initial-audio-sync"
  | "hr-seek-framedrop"
  | "term-osd-bar"
  | "video-osd"
  | "idle"
  | "input-terminal"
  | "screenshot-sw"
  | "cookies"
  | "tls-verify"
  | "deinterlace"
  | "correct-pts"
  | "vd-queue-enable"
  | "ad-queue-enable"
  | "vd-lavc-fast"
  | "vd-lavc-show-all"
  | "vd-lavc-bitexact"
  | "vd-lavc-assume-old-x264"
  | "vd-lavc-check-hw-profile"
  | "vd-apply-cropping"
  | "ad-lavc-downmix"
  | "demuxer-lavf-allow-mimetype"
  | "demuxer-lavf-hacks"
  | "demuxer-lavf-propagate-opts"
  | "demuxer-mkv-probe-video-duration"
  | "demuxer-mkv-probe-start-time"
  | "sub-forced-events-only"
  | "stretch-dvd-subs"
  | "stretch-image-subs-to-screen"
  | "image-subs-video-resolution"
  | "sub-fix-timing"
  | "sub-stretch-durations"
  | "sub-gray"
  | "sub-ass"
  | "sub-use-margins"
  | "sub-ass-force-margins"
  | "sub-vsfilter-bidi-compat"
  | "embeddedfonts"
  | "sub-ass-justify"
  | "sub-scale-by-window"
  | "sub-scale-with-window"
  | "sub-ass-scale-with-window"
  | "sub-clear-on-seek"
  | "sub-past-video-end"
  | "sub-bold"
  | "sub-italic"
  | "sub-visibility"
  | "secondary-sub-visibility"
  | "sub-filter-sdh"
  | "sub-filter-sdh-harder"
  | "sub-filter-regex-enable"
  | "sub-filter-regex-plain"
  | "sub-filter-regex-warn"
  | "osd-scale-by-window"
  | "force-rgba-osd-rendering"
  | "osd-bold"
  | "osd-italic"
  | "openal-direct-channels"
  | "ao-null-untimed"
  | "ao-null-broken-eof"
  | "ao-null-broken-delay"
  | "ao-pcm-waveheader"
  | "ao-pcm-append"
  | "screenshot-jpeg-source-chroma"
  | "screenshot-webp-lossless"
  | "screenshot-high-bit-depth"
  | "screenshot-tag-colorspace"
  | "audio-resample-linear"
  | "audio-normalize-downmix"
  | "input-default-bindings"
  | "input-builtin-bindings"
  | "input-builtin-dragging"
  | "input-test"
  | "input-right-alt-gr"
  | "input-cursor"
  | "input-vo-keyboard"
  | "input-media-keys"
  | "input-preprocess-wheel"
  | "input-touch-emulate-mouse"
  | "input-gamepad"
  | "window-dragging"
  | "clipboard-enable"
  | "clipboard-monitor"
  | "taskbar-progress"
  | "snap-window"
  | "ontop"
  | "border"
  | "title-bar"
  | "on-all-workspaces"
  | "auto-window-resize"
  | "window-minimized"
  | "window-maximized"
  | "force-render"
  | "force-window-position"
  | "fullscreen"
  | "fs"
  | "input-cursor-passthrough"
  | "native-keyrepeat"
  | "video-unscaled"
  | "video-recenter"
  | "keepaspect"
  | "keepaspect-window"
  | "hidpi-window-scale"
  | "native-fs"
  | "native-touch"
  | "show-in-taskbar"
  | "vo-direct3d-force-power-of-2"
  | "vo-direct3d-disable-texture-align"
  | "vo-direct3d-swap-discard"
  | "vo-direct3d-exact-backbuffer"
  | "sdl-sw"
  | "sdl-switch-mode"
  | "sdl-vsync"
  | "vo-image-jpeg-source-chroma"
  | "vo-image-webp-lossless"
  | "vo-image-high-bit-depth"
  | "vo-image-tag-colorspace"
  | "vo-tct-256"
  | "vo-kitty-config-clear"
  | "vo-kitty-alt-screen"
  | "vo-kitty-use-shm"
  | "cache-on-disk"
  | "demuxer-donate-buffer"
  | "force-seekable"
  | "access-references"
  | "sub-create-cc-track"
  | "autocreate-playlist"
  | "rar-list-all-volumes"
  | "load-unsafe-playlists"
  | "gpu-debug"
  | "gpu-sw"
  | "gamma-auto"
  | "inverse-tone-mapping"
  | "tone-mapping-visualize"
  | "opengl-pbo"
  | "scaler-resizes-only"
  | "correct-downscaling"
  | "linear-downscaling"
  | "linear-upscaling"
  | "sigmoid-upscaling"
  | "temporal-dither"
  | "opengl-rectangle-textures"
  | "interpolation"
  | "blend-subtitles"
  | "deband"
  | "gpu-shader-cache"
  | "use-embedded-icc-profile"
  | "icc-profile-auto"
  | "icc-cache"
  | "icc-force-contrast"
  | "icc-use-luma"
  | "allow-delayed-peak-detect"
  | "interpolation-preserve"
  | "opengl-glfinish"
  | "opengl-waitvsync"
  | "opengl-early-flush"
  | "vulkan-async-transfer"
  | "vulkan-async-compute"
  | "d3d11-flip"
  | "d3d11-exclusive-fs"
  | "d3d11va-zero-copy"
  | "angle-flip"
  | "sws-fast"
  | "sws-bitexact"
  | "sws-allow-zimg"
  | "zimg-fast"
  | "orawts"
  | "ocopy-metadata"

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
export type VoName = "gpu-next" | "gpu" | (string & {})
export type GpuContext = "d3d11" | (string & {})
export type OsdAssCc = { 0: string; 1: string }
export type Af = string[]
export type Vo = {
  enabled: boolean
  name: VoName
  params: Record<string, string>
}

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

export type MsgLevel =
  | "warn"
  | "error"
  | "no"
  | "fatal"
  | "info"
  | "status"
  | "v"
  | "debug"
  | "trace"
export type DirectoryFilterType = "video" | "audio" | "image"

export type OsetMetadata = { title?: string; comment?: string }
export type NativeProp = {
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
  "current-vo": VoName
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
  "msg-level": Record<string, MsgLevel>
  "gpu-api": GpuContext[]
  "oset-metadata": OsetMetadata
  "oremove-metadata": string[]
  oacopts: Record<string, string>
  ovcopts: Record<string, string>
  ofopts: Record<string, string>
  "libplacebo-opts": Record<string, string>
  "glsl-shader-opts": Record<string, string>
  "glsl-shaders": string[]
  "vo-image-avif-opts": Record<string, string>
  vo: Vo[]
  "screenshot-avif-opts": Record<string, string>
  "audio-swresample-o": Record<string, string>
  "sub-filter-jsre": string[]
  "sub-filter-regex": string[]
  "directory-filter-types": DirectoryFilterType[]
  "sub-ass-style-overrides": string[]
  "sub-ass-force-style": string[]
  "sub-lavc-o": Record<string, string>
  "stream-lavf-o": Record<string, string>
  alang: string
  slang: string
  vlang: string
  "sub-file-paths": string[]
  "audio-file-paths": string[]
  "external-files": string[]
  "sub-files": string[]
  "audio-files": string[]
  "cover-art-files": string[]
  "reset-on-next-file": string[]
  scripts: string[]
  "script-opts": Record<string, string>
  "ytdl-raw-options": Record<string, string>
  "display-tags": string[]
  "sub-auto-exts": string[]
  "audio-exts": string[]
  "vd-lavc-o": Record<string, string>
  "ad-lavc-o": Record<string, string>
  "demuxer-lavf-o": Record<string, string>
  "http-header-fields": string[]
  "audio-file-auto-exts": string[]
  "image-exts": string[]
  "cover-art-auto-exts": string[]
  "cover-art-whitelist": string[]
  "video-exts": string[]
  "input-commands": string[]
  "watch-later-options": string[]
}
