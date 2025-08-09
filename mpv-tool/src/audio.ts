import { commandNativeAsync, getMpvExePath } from "./mpv"

export type AudioConfig = {
  loop: number
  volume: number
  start: number
}

const DefaultConfig: AudioConfig = {
  loop: 0,
  volume: 100,
  start: 0,
}

export function playAudio(url: string, config: Partial<AudioConfig> = {}) {
  const { volume, start, loop } = {
    ...DefaultConfig,
    ...config,
  }
  const mpv = getMpvExePath()
  const args = [
    mpv,
    url,
    `--start=${start}`,
    `--loop=${loop}`,
    `--volume=${volume}`,
    "--no-video",
    "--force-window=no",
    "--really-quiet",
    "--load-scripts=no",
    "--no-terminal",
    "--vo=null",
    "--load-auto-profiles=no",
    "--load-osd-console=no",
    "--load-stats-overlay=no",
    "--osc=no",
    "--vd-lavc-skiploopfilter=all",
    "--vd-lavc-skipidct=all",
    "--vd-lavc-software-fallback=1",
    "--vd-lavc-fast",
    "--vd-lavc-threads=2",
    "--hwdec=auto",
    "--edition=auto",
    "--sub=no",
    "--no-sub",
    "--sub-auto=no",
    "--audio-file-auto=no",
    "--keep-open=no",
    "--idle=no",
  ]
  return commandNativeAsync({
    name: "subprocess",
    args,
    playback_only: false,
    capture_stdout: true,
    capture_stderr: true,
  })
}
