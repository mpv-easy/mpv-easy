import { build } from "esbuild"
import { solidPlugin } from "esbuild-plugin-solid"

build({
  entryPoints: ["./src/examples/index.tsx"],
  bundle: true,
  outdir: "bundle",
  // minify: true,

  // TODO: solid not support node platform?
  // platform:"node",
  charset: 'utf8',
  define: {
    "globalThis.version": '\"0.1.9\"',
    "process.env.NODE_ENV": '\"production\"'
  },
  plugins: [
    solidPlugin({
      solid: {
        moduleName: "@r-tui/solid",
        generate: "universal",
      },
    }),
  ],
}).catch(() => process.exit(1))
