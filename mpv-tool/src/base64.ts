import { command, commandNative, lastError, print, writeFile } from "./mpv"

export function writeStringFile(path: string, content: string) {
  return writeFile(path, content)
}

export function writeBinaryFile(path: string, base64: string) {
  const tmpPath = "file://__tmp__.txt"
  writeFile(tmpPath, base64)
  const e = lastError()
  const r = commandNative({
    name: "certutil.exe",
    args: ["-decode", "__tmp__.txt", "C:/a.exe"],
    playback_only: false,
    capture_stdout: true,
    capture_stderr: true,
  })
  commandNative({
    name: "rm",
    args: ["__tmp__.txt"],
    playback_only: false,
    capture_stdout: true,
    capture_stderr: true,
  })
}
