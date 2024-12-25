import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

export default defineConfig({
  source: {
    entry: {
      index: "./src/main.tsx",
    },
  },

  tools: {
    rspack: {
      module: {
        rules: [
          {
            test: /\.glsl?$/,
            // use: 'raw-loader',
            // loader: 'raw',
            type: "asset/source",
            exclude: /node_modules/,
            //  +       type: 'asset/source'
          },
        ],
      },
    },
    // rspack: {
    //   resolveLoader: {

    //   }
    // }
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.less$/,
  //       use: [
  //         {
  //           loader: 'less-loader',
  //         },
  //       ],
  //       type: 'css',
  //     },
  //   ],
  // },
  plugins: [pluginReact()],
  html: {
    title: "mpv-easy-react",
  },
})
