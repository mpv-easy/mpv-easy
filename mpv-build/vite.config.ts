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
          antd: "https://esm.sh/antd?standalone",
          "fuse.js": "https://esm.sh/fuse.js?standalone",
          "@ant-design/icons": "https://esm.sh/@ant-design/icons?standalone",
        },
  },
})
