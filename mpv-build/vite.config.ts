import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import analyzer from "vite-bundle-analyzer"

const isDev = process.env.NODE_ENV === "development"

// https://vite.dev/config/
export default defineConfig({
  base: "/mpv-build/",
  plugins: [
    react(),
    analyzer({
      enabled: !!process.env.analyzer,
    }),
  ],
  resolve: {
    alias: isDev
      ? {}
      : {
          react: "https://esm.sh/react",
          "react-dom": "https://esm.sh/react-dom",
          "@easy-install/easy-archive":
            "https://esm.sh/@easy-install/easy-archive?standalone",
          "fuse.js": "https://esm.sh/fuse.js?standalone",
          "@mui/material": "https://esm.sh/@mui/material?standalone",
          "@mui/icons-material":
            "https://esm.sh/@mui/icons-material?standalone",
        },
  },
})
