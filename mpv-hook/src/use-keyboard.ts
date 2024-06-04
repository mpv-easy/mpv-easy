import {
  AlphabetKeys,
  CtrlKeys,
  type InputKey,
  NumberKeys,
  PunctuationKeys,
  addForcedKeyBinding,
  addKeyBinding,
  osdMessage,
  print,
} from "@mpv-easy/tool"
import { useState } from "react"
const keys = ([] as string[]).concat(
  CtrlKeys,
  NumberKeys,
  AlphabetKeys,
  PunctuationKeys,
)
export function useInput() {
  const [char, setChar] = useState("" as InputKey)
  for (const key of keys) {
    addKeyBinding(
      key,
      `__use-keyboard-${key}`,
      () => {
        setChar(char)
      },
      { repeatable: true },
    )
  }
  return [char, setChar]
}
