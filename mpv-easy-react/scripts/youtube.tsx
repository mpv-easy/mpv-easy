import "@mpv-easy/polyfill"
import { render } from "@mpv-easy/react"
import { Youtube, defaultYoutubeConfig } from "@mpv-easy/youtube"
import React from "react"
import { getOptions, detectCookies } from "@mpv-easy/tool"

const options = {
  ...defaultYoutubeConfig,
  ...getOptions("mpv-easy-youtube", {
    "cookies-path": { type: "string", key: "cookiesPath" },
    cols: { type: "number", key: "cols" },
    rows: { type: "number", key: "rows" },
    "title-color": { type: "color", key: "titleColor" },
    "title-color-hover": { type: "color", key: "titleColorHover" },
    "title-background-color": { type: "color", key: "titleBackgroundColor" },
    "loading-color": { type: "color", key: "loadingColor" },
    "loading-background-color": {
      type: "color",
      key: "loadingBackgroundColor",
    },
    "overlay-background-color": {
      type: "color",
      key: "overlayBackgroundColor",
    },
    "title-font-size": { type: "number", key: "titleFontSize" },
    "title-font": { type: "string", key: "titleFont" },
  }),
}

function App() {
  return (
    <Youtube
      cookiesPath={options.cookiesPath || detectCookies()}
      cols={options.cols}
      rows={options.rows}
      titleColor={options.titleColor}
      titleColorHover={options.titleColorHover}
      titleBackgroundColor={options.titleBackgroundColor}
      loadingColor={options.loadingColor}
      loadingBackgroundColor={options.loadingBackgroundColor}
      overlayBackgroundColor={options.overlayBackgroundColor}
      titleFontSize={options.titleFontSize}
      titleFont={options.titleFont}
    />
  )
}

render(<App />)
