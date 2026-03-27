import { isDll, isFont } from "@mpv-easy/tool"
import { Script } from "./meta"
import { File } from "@easy-install/easy-archive"
import { appendScriptConf, commonPrefix, convertURL } from "./tool"

export async function downloadBinary(url: string): Promise<Uint8Array> {
  const buf = await fetch(url).then((resp) => resp.arrayBuffer())
  return new Uint8Array(buf)
}

export async function downloadBinaryFromGithub(
  url: string,
): Promise<Uint8Array | undefined> {
  const resp = await fetch(convertURL(url))
  if (resp.status !== 200) {
    return
  }
  const buf = await resp.arrayBuffer()
  return new Uint8Array(buf)
}

export async function downloadText(url: string): Promise<string> {
  return await fetch(url).then((resp) => resp.text())
}

export async function downloadJson<T>(url: string): Promise<T> {
  return (await fetch(url).then((resp) => resp.json())) as T
}

export function getFileNameFromUrl(url: string): string {
  return url.split("/").at(-1)!
}

export function getLang(url: string) {
  return url.split(".").at(-1)
}

export function installScript(
  mpvFiles: File[],
  scriptFiles: File[],
  script: Script,
  configDir = "portable_config",
) {
  const scriptDir = script.scriptName || script.name
  const isLua = (p: string) => p.toLowerCase().endsWith(".lua")
  const isJs = (p: string) => p.toLowerCase().endsWith(".js")

  // fonts, script-opts, shaders
  for (const dir of ["fonts", "script-opts", "shaders"]) {
    const prefix = `${dir}/`
    const files = scriptFiles.filter((i) => i.path.startsWith(prefix))
    if (files.length === 0) continue
    scriptFiles = scriptFiles.filter((i) => !i.path.startsWith(prefix))
    for (const i of files) {
      i.path = `${configDir}/${dir}/${i.path.slice(prefix.length)}`
      mpvFiles.push(i)
    }
  }

  // scripts
  const isInScripts = (i: File) => i.path.startsWith("scripts/")
  const scriptPrefixFiles = scriptFiles.filter(isInScripts)
  if (scriptPrefixFiles.length > 0) {
    const files = scriptPrefixFiles
    scriptFiles = scriptFiles.filter((i) => !isInScripts(i))

    const dirList = files
      .map((i) => i.path.split("/"))
      .map((i) => i.slice(1, i.length - 1))
    const commonPrefixIndex = commonPrefix(dirList)
    const commonPrefixList = commonPrefixIndex
      ? ["scripts", ...dirList[0].slice(0, commonPrefixIndex)]
      : ["scripts"]
    const commonPrefixString = `${commonPrefixList.join("/")}/`

    const isTopLevel = (i: File) =>
      !i.path.replace(commonPrefixString, "").includes("/")

    const luaFiles = files.filter((i) => isTopLevel(i) && isLua(i.path))
    const jsFiles = files.filter((i) => isTopLevel(i) && isJs(i.path))
    if (luaFiles.length === 1) {
      luaFiles[0].path = `${scriptDir}/main.lua`
    } else if (jsFiles.length === 1) {
      jsFiles[0].path = `${scriptDir}/main.js`
    } else {
      const nameLower = scriptDir.toLowerCase()
      const mainIndex = files.findIndex((i) => {
        const p = i.path.toLowerCase()
        return p.endsWith(`${nameLower}.lua`) || p.endsWith(`${nameLower}.js`)
      })
      if (mainIndex !== -1) {
        const mainFile = files.splice(mainIndex, 1)[0]
        const ext = mainFile.path.slice(mainFile.path.lastIndexOf("."))
        mainFile.path = `${configDir}/scripts/${scriptDir}/main${ext}`
        mpvFiles.push(mainFile)
      }
    }

    for (const i of files) {
      i.path = `${configDir}/scripts/${i.path.replace(commonPrefixString, `${scriptDir}/`)}`
      mpvFiles.push(i)
    }
  }

  // externals
  const isInExternals = (i: File) => i.path.startsWith("externals/")
  const externalFiles = scriptFiles.filter(isInExternals)
  if (externalFiles.length > 0) {
    scriptFiles = scriptFiles.filter((i) => !isInExternals(i))
    for (const i of externalFiles) {
      i.path = i.path.slice("externals/".length)
      mpvFiles.push(i)
    }
  }

  // input.conf and mpv.conf
  for (const name of ["input.conf", "mpv.conf"]) {
    const scriptConfIndex = scriptFiles.findIndex((i) => i.path === name)
    if (scriptConfIndex === -1) continue
    const scriptConf = scriptFiles.splice(scriptConfIndex, 1)[0]

    const fileIndex = mpvFiles.findIndex(
      (i) => i.path === `${configDir}/${name}`,
    )
    const file =
      fileIndex === -1
        ? new File(
            `${configDir}/${name}`,
            new Uint8Array(),
            undefined,
            false,
            BigInt(Date.now()),
          )
        : mpvFiles.splice(fileIndex, 1)[0]

    const { path, mode, isDir, lastModified, buffer } = file
    const newBuffer = appendScriptConf(buffer, scriptConf.buffer, script)
    mpvFiles.push(new File(path, newBuffer, mode, isDir, lastModified))
  }

  // conf
  const isRootConf = (i: File) =>
    !i.path.includes("/") && i.path.endsWith(".conf")
  const confFiles = scriptFiles.filter(isRootConf)
  if (confFiles.length > 0) {
    scriptFiles = scriptFiles.filter((i) => !isRootConf(i))
    for (const i of confFiles) {
      const hasScript =
        scriptFiles.some((s) => s.path === i.path.replace(".conf", ".js")) ||
        scriptFiles.some((s) => s.path === i.path.replace(".conf", ".lua"))
      i.path = hasScript ? `${configDir}/script-opts/${i.path}` : i.path
      mpvFiles.push(i)
    }
  }

  // font file
  const isRootFont = (i: File) => !i.path.includes("/") && isFont(i.path)
  const fontFiles = scriptFiles.filter(isRootFont)
  if (fontFiles.length > 0) {
    scriptFiles = scriptFiles.filter((i) => !isRootFont(i))
    for (const i of fontFiles) {
      i.path = `${configDir}/fonts/${i.path}`
      mpvFiles.push(i)
    }
  }

  // dll file
  const isRootDll = (i: File) => !i.path.includes("/") && isDll(i.path)
  const dllFiles = scriptFiles.filter(isRootDll)
  if (dllFiles.length > 0) {
    scriptFiles = scriptFiles.filter((i) => !isRootDll(i))
    for (const i of dllFiles) {
      i.path = `${configDir}/scripts/${i.path}`
      mpvFiles.push(i)
    }
  }

  // rename to main
  const luaFiles = scriptFiles.filter(
    (i) => !i.path.includes("/") && isLua(i.path),
  )
  const jsFiles = scriptFiles.filter(
    (i) => !i.path.includes("/") && isJs(i.path),
  )
  if (luaFiles.length === 1) {
    luaFiles[0].path = "main.lua"
  } else if (jsFiles.length === 1) {
    jsFiles[0].path = "main.js"
  }

  for (const i of scriptFiles) {
    i.path = `${configDir}/scripts/${scriptDir}/${i.path}`
    mpvFiles.push(i)
  }
}
// Builtin scripts that conflict with each other
export const ConflictMap: string[][] = [
  ["thumbfast", "mpv-easy-thumbfast"],
  ["autoload", "mpv-easy-autoload"],
  ["uosc", "mpv-easy", "ModernX cyl0", "ModernZ", "mpv.net"],
]

// Builtin scripts that includes other scripts
export const IncludesMap: Record<string, string[]> = {
  uosc: ["autoload", "mpv-easy-autoload"],
  "mpv-easy": [
    "mpv-easy-anime4k",
    "mpv-easy-clipboard-play",
    "mpv-easy-copy-time",
    "mpv-easy-cut",
    "mpv-easy-translate",
    "mpv-easy-autoload",
    "mpv-easy-copy-screen",
    "mpv-easy-crop",
    "mpv-easy-thumbfast",
    "mpv-easy-frame-seeker",
    "mpv-easy-sponsorblock",
  ],
}

export function checkConflict(
  packages: string[],
  conflictMap = ConflictMap,
): string[] {
  for (const g of conflictMap) {
    const conflicts: string[] = []
    for (const pkg of packages) {
      if (g.includes(pkg)) {
        conflicts.push(pkg)
      }
    }

    if (conflicts.length > 1) {
      return conflicts
    }
  }

  const conflictSet = new Set<string>()
  const packageSet = new Set(packages)

  for (const pkg in packages) {
    const conflicts = IncludesMap[pkg] || []
    for (const conflict of conflicts) {
      if (packageSet.has(conflict)) {
        conflictSet.add(pkg)
        conflictSet.add(conflict)
      }
    }
  }

  return Array.from(conflictSet)
}
