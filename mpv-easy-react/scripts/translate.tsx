import "@mpv-easy/polyfill"
import { render, Tooltip } from "@mpv-easy/react"
import {
  Translation,
  defaultSubConfig,
  defaultTooltipConfig,
} from "@mpv-easy/translate"
import React from "react"
import { getOptions, getPropertyNumber } from "@mpv-easy/tool"

const {
  subFontSize,
  subColor,
  subBackColor,
  subBackColorHover,
  subColorHover,
  subBold,
  subScale,
  subOutlineSize,
  subOutlineColor,
  subZIndex,
  targetLang,
  sourceLang,
  tooltioFontSize,
  tooltipColor,
  tooltipBackColor,
  tooltipScale,
  tooltipBold,
  tooltipOutlineSize,
  tooltipOutlineColor,
  tooltipMaxWidth,
  tooltipZIndex,
  tooltipLeft,
  tooltipBottom,
  firstSubColor,
  secondSubColor,
  firstSubFontface,
  secondSubFontface,
  subOutputPath,
} = {
  ...defaultSubConfig,
  ...defaultTooltipConfig,
  ...getOptions("mpv-easy-translate", {
    "sub-color": { type: "color", key: "subColor" },
    "sub-back-color": {
      type: "color",
      key: "subBackColor",
    },
    "sub-back-color-hover": {
      type: "color",
      key: "subBackColorHover",
    },
    "sub-color-hover": {
      type: "color",
      key: "subColorHover",
    },
    "sub-bold": { type: "boolean", key: "subBold" },
    "sub-outline-size": { type: "number", key: "subOutlineSize" },
    "sub-outline-color": {
      type: "color",
      key: "subOutlineColor",
    },
    "sub-zindex": { type: "number", key: "subZIndex" },
    "tooltip-font-size": {
      type: "number",
      key: "tooltioFontSize",
    },
    "tooltip-color": {
      type: "color",
      key: "tooltipColor",
    },
    "tooltip-back-color": {
      type: "color",
      key: "tooltipBackColor",
    },
    "tooltip-scale": { type: "number", key: "tooltipScale" },
    "tooltip-bold": { type: "boolean", key: "tooltipBold" },
    "tooltip-outline-size": {
      type: "number",
      key: "tooltipOutlineSize",
    },
    "tooltip-outline-color": {
      type: "color",
      key: "tooltipOutlineColor",
    },
    "tooltip-max-width": {
      type: "number",
      key: "tooltipMaxWidth",
    },
    "tooltip-zindex": { type: "number", key: "tooltipZIndex" },
    "tooltip-left": { type: "number", key: "tooltipLeft" },
    "tooltip-bottom": { type: "number", key: "tooltipBottom" },
    "target-lang": { type: "string", key: "targetLang" },
    "source-lang": { type: "string", key: "sourceLang" },
    "sub-srt-scale": { type: "number", key: "subSrtScale" },
    "first-sub-color": { type: "string", key: "firstSubColor" },
    "second-sub-color": { type: "string", key: "secondSubColor" },
    "first-sub-fontface": { type: "string", key: "firstSubFontface" },
    "second-sub-fontface": { type: "string", key: "secondSubFontface" },
    "sub-output-path": { type: "string", key: "subOutputPath" },
  }),
  subScale: getPropertyNumber("sub-scale", 1),
  subFontSize: getPropertyNumber("sub-font-size", 38),
}

function App() {
  return (
    <>
      <Tooltip
        zIndex={tooltipZIndex}
        maxWidth={tooltipMaxWidth}
        backgroundColor={tooltipBackColor}
        fontSize={tooltioFontSize * tooltipScale}
        color={tooltipColor}
        fontWeight={tooltipBold ? "bold" : "normal"}
        borderColor={tooltipOutlineColor}
        borderSize={tooltipOutlineSize}
        display="flex"
        justifyContent="center"
        alignItems="center"
      />
      <Translation
        zIndex={subZIndex}
        subFontSize={subFontSize}
        subScale={subScale}
        subColor={subColor}
        subBold={subBold}
        subOutlineSize={subOutlineSize}
        subOutlineColor={subOutlineColor}
        sourceLang={sourceLang}
        targetLang={targetLang}
        subBackColor={subBackColor}
        subBackColorHover={subBackColorHover}
        subColorHover={subColorHover}
        left={tooltipLeft}
        bottom={tooltipBottom}
        firstSubColor={firstSubColor}
        secondSubColor={secondSubColor}
        firstSubFontface={firstSubFontface}
        secondSubFontface={secondSubFontface}
        subOutputPath={subOutputPath}
      />
    </>
  )
}

render(<App />)
