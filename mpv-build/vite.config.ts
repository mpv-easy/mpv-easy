import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import analyzer from "vite-bundle-analyzer"

// https://vite.dev/config/
export default defineConfig({
  base: "https://mpv-easy.github.io/mpv-build/",
  plugins: [
    react(),
    analyzer({
      enabled: !!process.env.analyzer,
    }),
  ],
  resolve: {
    alias: {
      react: "https://esm.sh/react",
      "react-dom": "https://esm.sh/react-dom",
      "@easy-install/easy-archive": "https://esm.sh/@easy-install/easy-archive",
    },
  },
})
