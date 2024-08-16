import { Button } from "@mpv-easy/solid"
import * as ICON from "../icon"
import { createSignal } from "solid-js"

export function ButtonHover() {
  const [count, setCount] = createSignal(0)
  return (
    <Button
      id="1"
      font="JetBrainsMono NFM Regular"
      backgroundColor="#000000"
      backgroundColorHover="#00FF00"
      fontSize={128}
      width={500}
      height={500}
      display="flex"
      justifyContent="center"
      alignItems="center"
      color="#FFFFFF"
    >
      <Button
        enableMouseStyle={true}
        text={ICON.Minus}
        id="2"
        onMouseDown={() => {
          console.log("minus: ", count())
          setCount((c) => --c)
        }}
        backgroundColor="#000000"
        backgroundColorHover="#FFFFFF"
        colorHover="#00FFFF"
        alignContent="stretch"
      />
      <Button
        id="3"
        text={count().toString()}
        backgroundColor="#000000"
        backgroundColorHover="#FFFFFF"
        colorHover="#00FFFF"
      />
      <Button
        enableMouseStyle={true}
        id="4"
        backgroundColor="#000000"
        backgroundColorHover="#FFFFFF"
        colorHover="#00FFFF"
        color="#FFFFFF"
        onMouseDown={() => {
          console.log("plus: ", count())
          setCount((c) => ++c)
        }}
        text={ICON.Plus}
      />
    </Button>
  )
}
