import Cac from "cac"
import { install } from "./install"
import { uninstall } from "./uninstall"
import { configDetect, getScriptsDir, setConfigDir } from "./config"
import { list } from "./list"
import { update, updateAll } from "./update"
import { version } from "../package.json"
import chalk from "chalk"
import { backup } from "./backup"
import { restore } from "./restore"
import { fetch } from "undici"
import { getProxyFromEnv } from "./proxy"

const proxyAgent = getProxyFromEnv()
// FIXME: https://github.com/mpv-easy/mpv-easy/issues/139

globalThis.fetch = (url: string, opt: any) => {
  return fetch(url, { dispatcher: proxyAgent, ...opt })
}

const cli = Cac("mpsm")

cli
  .command(
    "set-config-dir <dir>",
    "set mpv config dir eg: <mpv-dir>/portable_config",
  )
  .action((dir) => {
    setConfigDir(dir)
  })

cli.command("get-script-dir", "get mpv script dir").action(() => {
  configDetect()
  const dir = getScriptsDir()
  console.log(dir)
})

cli.command("install <...scripts>", "install script").action((scripts) => {
  configDetect()
  install(scripts)
})

cli
  .command("update [...scripts]", "install script")
  .option("--all", "update all script")
  .action((scripts, option) => {
    configDetect()
    if (!scripts?.length && !option.all) {
      console.log(
        `run ${chalk.green("mpsm update <script>")} or ${chalk.green(
          "mpsm update --all",
        )}`,
      )
      process.exit()
    }

    if (option.all) {
      updateAll()
    } else {
      update(scripts)
    }
  })

cli.command("uninstall <...scripts>", "uninstall script").action((scripts) => {
  configDetect()
  uninstall(scripts)
})

cli.command("list", "list installed scripts").action(() => {
  configDetect()
  list()
})

cli
  .command("backup [file]", "backup all installed scripts to json file")
  .action((file) => {
    configDetect()
    backup(file)
  })

cli
  .command("restore <file>", "restore scripts from json file")
  .action((file) => {
    configDetect()
    restore(file)
  })

cli.version(version)

cli.help()

cli.parse()
