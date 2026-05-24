import { build } from "esbuild"
import { writeFile } from "node:fs/promises"
import { name } from "../package.json"

const fileName = name.split("/").at(-1)!
const outDir = "./bundle"

async function main() {
  const { metafile } = await build({
    entryPoints: ["./src/index.tsx"],
    bundle: true,
    minify: true,
    outfile: `${outDir}/${fileName}.js`,
    charset: "utf8",
    define: {
      "globalThis.version": '"0.1.15-alpha.20"',
      "process.env.NODE_ENV": '"production"',
    },
    metafile: true,
    format: "esm",
  })
  await writeFile(`${outDir}/metafile.json`, JSON.stringify(metafile))
  console.log(`${fileName}.js bundled`)
}

main().catch((error) => {
  console.error("build failed:", error)
  process.exit(1)
})
