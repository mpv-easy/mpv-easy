import { execAsync, execSync, getOs } from "../common"
import { existsSync } from "../fs"
import { normalize } from "../path"
import { getRsExtExePath } from "./share"

export function mkdir(dir: string, exe = getRsExtExePath()) {
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        const cmd = [
          "powershell",
          "-c",
          `New-Item -Path "${normalize(dir)}" -ItemType Directory -Force`,
        ]
        execSync(cmd)
        return true
      }
      case "linux":
      case "darwin":
      case "android": {
        return false
      }
    }
  }

  return execSync([exe, "fs", "mkdir", JSON.stringify(dir)])
}

export function removeDir(dir: string, exe = getRsExtExePath()) {
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        const cmd = [
          "powershell",
          "-c",
          `Remove-Item -Path "${normalize(dir)}"`,
        ]
        return execSync(cmd)
      }
      case "linux":
      case "darwin":
      case "android": {
        return ""
      }
    }
  }
  return execSync([exe, "fs", "remove_dir", JSON.stringify(dir)])
}
export function removeFile(dir: string, exe = getRsExtExePath()) {
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        const cmd = [
          "powershell",
          "-c",
          `Remove-Item -Path "${normalize(dir)}" -Force`,
        ]
        execSync(cmd)
        return true
      }
      case "linux":
      case "darwin":
      case "android": {
        return false
      }
    }
  }
  return execSync([exe, "fs", "remove_file", JSON.stringify(dir)])
}
export function removeDirAll(dir: string, exe = getRsExtExePath()) {
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        const cmd = [
          "powershell",
          "-c",
          `Remove-Item -Path "${normalize(dir)}" -Recurse -Force`,
        ]
        execSync(cmd)
        return true
      }
      case "linux":
      case "darwin":
      case "android": {
        return false
      }
    }
  }
  return execSync([exe, "fs", "remove_dir_all", JSON.stringify(dir)])
}

export async function mkdirAsync(dir: string, exe = getRsExtExePath()) {
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        const cmd = [
          "powershell",
          "-c",
          `New-Item -Path "${normalize(dir)}" -ItemType Directory -Force`,
        ]
        await execAsync(cmd)
        return true
      }
      case "linux":
      case "darwin":
      case "android": {
        return false
      }
    }
  }
  return await execAsync([exe, "fs", "mkdir", JSON.stringify(dir)])
}
