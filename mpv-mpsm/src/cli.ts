import Cac from "cac"
import { install } from "./install"
import { uninstall } from "./uninstall"
import { configDetect, getScriptDir, setScriptDir } from "./config"
import { list } from "./list"
import { update, updateAll } from "./update"
import { version } from "../package.json"
import chalk from "chalk"

const cli = Cac("mpsm")

cli
  .command(
    "set-script-dir [dir]",
    "set mpv script dir eg: <mpv-dir>/portable_config/scripts",
  )
  .action((dir) => {
    setScriptDir(dir)
  })

cli.command("get-script-dir", "get mpv script dir").action(() => {
  configDetect()
  const dir = getScriptDir()
  console.log(dir)
})

cli.command("install [...scripts]", "install script").action((scripts) => {
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

cli.command("uninstall [...scripts]", "uninstall script").action((scripts) => {
  configDetect()
  uninstall(scripts)
})

cli.command("list", "list installed scripts").action(() => {
  configDetect()
  list()
})

cli.version(version)

cli.help()

cli.parse()
