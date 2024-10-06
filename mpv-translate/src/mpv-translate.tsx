import "@mpv-easy/polyfill";
import "@mpv-easy/tool";
import { render, Tooltip } from "@mpv-easy/react";
import { Translation } from "./ui";
import React from "react";
import { getColor, getPropertyBool, getPropertyNumber } from "@mpv-easy/tool";

function App() {
  const subFontScale = getPropertyNumber("sub-scale") || 1;
  const subFontSize = (getPropertyNumber("sub-font-size") || 55) * subFontScale;
  const subColor = getColor("sub-color") || "#FFFFFFFF";
  const subBold = getPropertyBool("sub-bold");
  const subOutlineSize = getPropertyNumber("sub-outline-size");
  const subOutlineColor = getColor("sub-outline-color");
  const subBackColor = getColor("sub-back-color");

  return (
    <>
      <Tooltip
        backgroundColor={"#00000000"}
        fontSize={subFontSize / 2}
        color={subColor}
        display="flex"
        justifyContent="center"
        alignItems="center"
        maxWidth={48}
        zIndex={1024}
      />
      <Translation
        subFontSize={subFontSize}
        subColor={subColor}
        subBold={subBold}
        subOutlineSize={subOutlineSize}
        subOutlineColor={subOutlineColor}
        zIndex={512}
        subBackCOlorHover="#00FFFF"
        subColorHover="#00FF00"
        // sourceLang={sourceLang}
        // targetLang={targetLang}
      />
    </>
  );
}

render(<App />);
