import Cac from "cac"
import { install } from "./install"
import { uninstall } from "./uninstall"
import { configDetect, getScriptDir, setScriptDir } from "./config"
import { list } from "./list"
import { update, updateAll } from "./update"

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

cli.command("install [...files]", "install script").action((files) => {
  configDetect()
  install(files)
})

cli
  .command("update [...files]", "install script")
  .option("--all", "update all script")
  .action((files, option) => {
    configDetect()
    console.log(files, option)
    if (option.all) {
      updateAll()
    } else {
      update(files)
    }
  })

cli.command("uninstall [...files]", "uninstall script").action((files) => {
  configDetect()
  uninstall(files)
})

cli.command("list", "list installed scripts").action(() => {
  configDetect()
  list()
})

cli.help()

cli.parse()
