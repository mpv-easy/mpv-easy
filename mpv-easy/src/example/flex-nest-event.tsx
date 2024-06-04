import { AssDraw } from "@mpv-easy/assdraw"
import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, render, type MouseEvent } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

function createHandler(id: string | number) {
  return {
    onMouseDown: (e: MouseEvent) => {
      console.log("down: ", id, e.target.attributes.id)
    },
    onMouseEnter: (e: MouseEvent) => {
      console.log("enter: ", id, e.target.attributes.id)
    },
    onMouseLeave: (e: MouseEvent) => {
      console.log("leave: ", id, e.target.attributes.id)
    },
    // onMouseMove: () => {
    //   console.log("move: ", id)
    // },
    onMousePress: (e: MouseEvent) => {
      console.log("press: ", id, e.target.attributes.id)
    },
    onMouseUp: (e: MouseEvent) => {
      console.log("up: ", id, e.target.attributes.id)
    },
    onFocus: (e: MouseEvent) => {
      console.log("focus: ", id, e.target.attributes.id)
    },
    onBlur: (e: MouseEvent) => {
      console.log("blur: ", id, e.target.attributes.id)
    },
  }
}
export function FlexNestEvent() {
  return (
    <Box
      id="flex-main"
      width={"50%"}
      height={"50%"}
      backgroundColor="FF0000"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      {...createHandler(1)}
    >
      <Box
        id="flex-1"
        width={"50%"}
        height={"50%"}
        backgroundColor="0000FF"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        {...createHandler(2)}
      >
        <Box
          id="flex-2"
          width={"50%"}
          height={"50%"}
          backgroundColor="00FFFF"
          display="flex"
          {...createHandler(3)}
          onMouseUp={(e) => {
            console.log("stop up 3")
            e.stopPropagation()
          }}
        />
      </Box>
    </Box>
  )
}
