import { join } from "node:path"
import { getConfigDir, getMpsmDir } from "./config"
import { outputFileSync } from "fs-extra"
import { type Script } from "./meta"
import {
  downloadBinary,
  downloadJson,
  downloadText,
  installScript,
} from "./share"
import chalk from "chalk"
import { existsSync, readFileSync } from "fs-extra"
import { ScriptRemoteUrl } from "./const"
import { isRemote } from "@mpv-easy/tool"
import { File, Fmt, decode } from "@easy-install/easy-archive"

export async function installFromUrl(url: string) {
  const text = await downloadText(url)
  const script: Script = JSON.parse(text)
  return installFromScript(script)
}

export async function installFromZip(script: Script, scriptFiles: File[]) {
  const mpvFiles: File[] = []
  const configDir = getConfigDir()

  for (const i of ["input.conf", "mpv.conf"]) {
    const filePath = join(configDir, i).replaceAll("\\", "/")
    if (existsSync(filePath)) {
      const buf = readFileSync(filePath)
      const file = new File(
        filePath,
        buf,
        undefined,
        false,
        BigInt(+new Date()),
      )
      mpvFiles.push(file)
    }
  }

  installScript(mpvFiles, scriptFiles, script, configDir)

  for (const i of mpvFiles) {
    outputFileSync(i.path, i.buffer)
  }
}

export async function installFromScript(script: Script): Promise<Script> {
  const dir = getMpsmDir()
  const bin = await downloadBinary(script.download)

  const scriptDir = join(dir, script.name)

  const ext = script.download.split(".").at(-1) || ""
  if (ext === "zip") {
    const files = decode(Fmt.Zip, bin)
    if (!files) {
      console.log(`zip decode error ${chalk.green(ext)}`)
      process.exit()
    }
    installFromZip(script, files)
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

export async function installFromMpsm(name: string) {
  const json = await downloadJson<Record<string, Script>>(ScriptRemoteUrl)
  const script = json[name]
  if (!script) {
    console.log(`not found script ${chalk.green(name)}`)
    process.exit()
  }
  return installFromScript(script)
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

export async function install(scripts: string[]) {
  for (const name of scripts) {
    const meta = await (isRemote(name)
      ? installFromUrl(name)
      : installFromMpsm(name))

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
