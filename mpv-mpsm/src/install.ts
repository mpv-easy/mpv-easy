import { join } from "node:path"
import { getAllScript, getConfigDir, getMpsmDir } from "./config"
import { outputFileSync } from "fs-extra"
import { type Script } from "./meta"
import {
  checkConflict,
  downloadBinary,
  downloadJson,
  downloadText,
  installScript,
} from "./share"
import chalk from "chalk"
import { existsSync, readFileSync } from "fs-extra"
import { ScriptRemoteUrl } from "./const"
import { File, Fmt, decode } from "@easy-install/easy-archive"
import { parseGitHubUrl, Repo } from "@mpv-easy/tool"
import { tryFix } from "./fix"

export async function installFromJSON(url: string, configDir?: string) {
  const text = await downloadText(url)
  const script: Script = JSON.parse(text)
  return installFromScript(script, configDir)
}

export async function installFromFiles(
  script: Script,
  scriptFiles: File[],
  configDir?: string,
) {
  const mpvFiles: File[] = []
  const resolvedConfigDir = configDir ?? getConfigDir()

  for (const i of ["input.conf", "mpv.conf"]) {
    const filePath = join(resolvedConfigDir, i).replaceAll("\\", "/")
    if (existsSync(filePath)) {
      const buf = readFileSync(filePath)
      const file = new File(filePath, buf, undefined, false, BigInt(Date.now()))
      mpvFiles.push(file)
    }
  }

  installScript(mpvFiles, scriptFiles, script, resolvedConfigDir)

  for (const i of mpvFiles) {
    outputFileSync(i.path, i.buffer)
  }
}

export async function installFromScript(
  script: Script,
  configDir?: string,
): Promise<Script> {
  const dir = getMpsmDir(configDir)
  const bin = await downloadBinary(script.download)

  const scriptDir = join(dir, script.name)

  const ext = script.download.split(".").at(-1) || ""
  if (ext === "zip") {
    const files = decode(Fmt.Zip, bin)
    if (!files) {
      console.log(`zip decode error ${chalk.green(ext)}`)
      process.exit()
    }
    installFromFiles(script, files, configDir)
  } else if (["json", "lua"].includes(ext)) {
    const scriptPath = join(scriptDir, `main.${ext}`)
    const scriptJsonPath = join(scriptDir, "script.json")
    outputFileSync(scriptPath, bin)
    outputFileSync(scriptJsonPath, JSON.stringify(script))
  } else {
    console.log(`not support script format ${chalk.green(ext)}`)
    process.exit()
  }

  return script
}

export async function installFromMpsm(name: string, configDir?: string) {
  const json = await downloadJson<Record<string, Script>>(ScriptRemoteUrl)
  const script = json[name]
  if (!script) {
    console.log(`not found script ${chalk.green(name)}`)
    process.exit()
  }
  return installFromScript(script, configDir)
}

// export async function installFromScript(url: string): Promise<Script> {
//   const text = await downloadText(url)
//   const meta = getScript(text)

//   if (!meta) {
//     console.log(`${url} don't have meta info`)
//     process.exit()
//   }

//   const downloadUrl = meta.download
//   await installFromUrl(downloadUrl, meta)
//   return meta
// }

async function installFromZip(url: string, configDir?: string) {
  const bin = existsSync(url)
    ? new Uint8Array(readFileSync(url))
    : await downloadBinary(url)
  const files = decode(Fmt.Zip, bin)
  if (!files) {
    throw new Error("failed to decode zip")
  }
  const file = files.find((i) => i.path === "script.json")
  if (!file) {
    throw new Error("failed to find script.json")
  }
  const decoder = new TextDecoder("utf-8")
  const string = decoder.decode(file.clone().buffer)
  const script: Script = JSON.parse(string)
  installFromFiles(script, files, configDir)
  return script
}

async function installFromGithub(
  { user, repo, bracnch = "main" }: Repo,
  configDir?: string,
): Promise<Script> {
  const url = `https://github.com/${user}/${repo}/archive/refs/heads/${bracnch}.zip`
  const zip = await downloadBinary(url)
  const files = decode(Fmt.Zip, zip)
  if (!files) {
    throw new Error("installFromGithub: failed to decode zip")
  }
  const script = {
    name: repo,
    author: user,
    download: url,
  }
  const fixFiles = tryFix(files, script)
  installFromFiles(script, fixFiles, configDir)
  return script
}

export async function install(scripts: string[], configDir?: string) {
  const names = [...getAllScript(configDir).map((i) => i.name), ...scripts]
  const c = checkConflict(names)
  if (c.length) {
    console.error("Conflict:", c.join(" "))
    return
  }

  for (const name of scripts) {
    let meta: Script
    const repo = parseGitHubUrl(name)
    if (name.endsWith(".json")) {
      meta = await installFromJSON(name, configDir)
    } else if (name.endsWith(".zip")) {
      meta = await installFromZip(name, configDir)
    } else if (repo) {
      meta = await installFromGithub(repo, configDir)
    } else {
      meta = await installFromMpsm(name, configDir)
    }

    const v: string[] = [chalk.green(meta.name)]

    if (meta.author?.length) {
      v.push(`@${chalk.green(meta.author)}`)
    }
    if (meta.version?.length) {
      v.push(`(${chalk.green(meta.version)})`)
    }
    console.log("Successfully installed:")
    console.log(v.join(""))
  }
}
