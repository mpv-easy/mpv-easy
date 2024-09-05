import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

export default defineConfig({
  source: {
    entry: {
      index: "./src/main.tsx",
    },
  },
  plugins: [pluginReact()],
  html: {
    title: "mpv-easy-react",
  },
})
