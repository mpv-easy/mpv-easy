import fs from "node:fs"

const code = fs.readFileSync("./dist/mpv-easy-play-with.js", "utf8")
const meta = fs.readFileSync("./meta.user.js", "utf8")

fs.writeFileSync("./dist/mpv-easy-play-with.user.js", `${meta}\n${code}`)
