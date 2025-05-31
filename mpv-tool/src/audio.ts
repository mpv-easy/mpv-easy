import { runCmdAsync } from "./ext"
import { getMpvExePath } from "./mpv"

export function playAudio(url: string, volume = 100, loop = 1) {
  const mpv = getMpvExePath()
  return runCmdAsync(
    `${mpv} --load-scripts=no --loop=${loop} --volume=${volume} --force-window=no ${url}`,
  )
}
