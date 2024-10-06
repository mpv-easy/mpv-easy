import {
  getLang,
  getPropertyBool,
  observeProperty,
  registerScriptMessage,
  setPropertyBool,
  playAuido,
} from "@mpv-easy/tool";
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, MpDom, MpDomProps } from "@mpv-easy/react";
import { bingClientSearch } from "./bing";
import { google } from "./google";
import { translate } from "./translate";

export type WordInfo = {
  word: string;
  detail: string[];
  audio?: string;
};

async function getWordInfo(w: string): Promise<WordInfo> {
  const text = await bingClientSearch(w);
  const detail = (text.match(/data-definition="(.*?)"/)?.[1] || "").split(";");
  const word = text.match(/data-word="(.*?)"/)?.[1] || w;
  const audio = text.match(/audiomd5="(.*?)"/)?.[1] || "";

  return {
    word,
    detail,
    audio,
  };
}

function split(str: string): string[] {
  return str.trim().replaceAll(/\s+/g, " ").replaceAll(" ", "  ").split(" ");
}

const PunctuationRegex = /[!"#$%&()*+,./:;<=>?@\[\]\^\{\|\}~]/g;
function cleanWord(w: string): string {
  return w.replaceAll(PunctuationRegex, "");
}

export function Word({
  word,
  showTitle,
  SubConfig,
}: {
  word: string;
  showTitle: boolean;
  SubConfig: SubConfig;
}) {
  const [info, setInfo] = useState<WordInfo>({
    word: "",
    detail: [],
  });
  const loading = useRef(false);

  useEffect(() => {
    if (loading.current || !word.length) return;
    loading.current = true;
    getWordInfo(cleanWord(word)).then((info) => {
      setInfo(info);
      loading.current = false;
    });
  }, [word]);
  return word.length ? (
    <Button
      onClick={async (e) => {
        if (e.event.key_name === "MBTN_LEFT") {
          if (info.audio?.length) {
            playAuido(info.audio);
          }
          // e.stopPropagation()
          // e.preventdetailault()
        }
      }}
      display="flex"
      position="relative"
      fontSize={SubConfig.subFontSize}
      color={SubConfig.subColor}
      fontBorderSize={SubConfig.subOutlineSize}
      fontBorderColor={SubConfig.subOutlineColor}
      fontWeight={SubConfig.subBold ? "bold" : "normal"}
      colorHover={SubConfig.subColorHover}
      backgroundColorHover={SubConfig.subBackCOlorHover}
      backgroundColor={SubConfig.subBackColor}
      title={showTitle ? info.detail.join("\n").trim() : ""}
      text={word}
    />
  ) : (
    <Box
      width={word === "" ? SubConfig.subFontSize / 2 : undefined}
      height={word === "" ? SubConfig.subFontSize / 2 : undefined}
    />
  );
}

function Line({ line, SubConfig }: { line: string; SubConfig: SubConfig }) {
  const words = split(line);
  const [showTitle, setShowTitle] = useState(true);
  const loading = useRef(false);
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (loading.current || !line.length) return;
    loading.current = true;
    google(line, getLang()).then((info) => {
      setTitle(info.trim());
      loading.current = false;
    });
  }, [line]);

  return (
    <Box
      position="relative"
      display="flex"
      width="100%"
      justifyContent="center"
      alignItems="end"
      alignContent="stretch"
      onClick={(e) => {
        if (e.event.key_name === "MBTN_MID") {
          setShowTitle((v) => !v);
        }
      }}
      title={showTitle ? "" : title}
    >
      {words.map((i, k) => (
        <Word
          showTitle={showTitle}
          key={[i, k].join(",")}
          word={i.trim()}
          SubConfig={SubConfig}
        />
      ))}
    </Box>
  );
}
export type SubConfig = {
  subFontSize: number;
  subColor: string;
  subBackColor: string;
  subBackCOlorHover: string;
  subColorHover: string;
  subBold: boolean;
  subScale: number;
  subOutlineSize: number;
  subOutlineColor: string;
  targetLang: string;
  sourceLang: string;
};

export type TranslationProps = MpDomProps & SubConfig;

export function Translation({
  subFontSize = 1,
  subColor = "string",
  subBackColor = "string",
  subBackCOlorHover = "string",
  subColorHover = "string",
  subBold = false,
  subScale = 1,
  subOutlineSize = 1,
  subOutlineColor = "string",
  targetLang = getLang(),
  sourceLang = "",
  ...props
}: Partial<TranslationProps>) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");

  const update = useRef<(s: string) => void>();
  update.current = (s: string) => {
    if (active) {
      setText(s || "");
    }
  };
  useEffect(() => {
    registerScriptMessage("translate", () => {
      translate({ targetLang, sourceLang });
    });

    registerScriptMessage("interactive-translate", async () => {
      setActive((v) => !v);
      setPropertyBool("sub-visibility", !getPropertyBool("sub-visibility"));
    });

    observeProperty("sub-text", "string", (_, value) => {
      update.current?.(value);
    });
  }, []);

  return (
    <Box
      display="flex"
      position="absolute"
      width="100%"
      height="100%"
      hide={!active}
      flexDirection="row"
      justifyContent="end"
      alignItems="center"
      {...props}
    >
      {text
        .trim()
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((i, k) => (
          <Line
            key={[i, k].join()}
            line={i}
            SubConfig={{
              subFontSize,
              subColor,
              subBackColor,
              subBackCOlorHover,
              subColorHover,
              subBold,
              subScale,
              subOutlineSize,
              subOutlineColor,
              targetLang,
              sourceLang,
            }}
          />
        ))}
    </Box>
  );
}
