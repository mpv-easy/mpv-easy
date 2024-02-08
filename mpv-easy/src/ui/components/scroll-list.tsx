import { getFileName, command, clamp } from "@mpv-easy/tool"
import {
  Box,
  Button,
  MouseEvent,
  DOMElement,
  ButtonProps,
  createNode,
} from "@mpv-easy/ui"
import React, { useRef, useState } from "react"
import { useSelector } from "react-redux"
import {
  buttonStyleSelector,
  mouseHoverStyleSelector,
  osdDimensionsSelector,
  scrollListStyleSelector,
} from "../../store"
import { measureText } from "@mpv-easy/ui/src/common"

export type ScrollListProps = {
  items: {
    key: string
    label: string
    onClick: (e: MouseEvent) => void
  }[]
}

function getMaxWidth(textList: string[], button: Partial<ButtonProps>) {
  let max = 0
  for (const i of textList) {
    const node = createNode("@mpv-easy/box")
    node.attributes = button
    node.attributes.text = i
    max = Math.max(max, measureText(node).width)
  }
  return max
}

export const ScrollList = React.memo(({ items }: ScrollListProps) => {
  const button = useSelector(buttonStyleSelector)
  const scrollListStyle = useSelector(scrollListStyleSelector)
  const maxItemCount = scrollListStyle.maxItemCount
  const [startIndex, setStartIndex] = useState(0)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const showScrollBar = maxItemCount < items.length
  const scrollListHeight = maxItemCount * (button.height + button.padding * 2)
  const scrollBarHeight = showScrollBar
    ? (maxItemCount / items.length) * scrollListHeight
    : 0
  const scrollBarSpace = scrollListHeight - scrollBarHeight
  const scrollBarTop =
    (startIndex / (items.length - maxItemCount)) * scrollBarSpace
  const visibleList = items.slice(startIndex, startIndex + maxItemCount)
  const max = getMaxWidth(
    items.map((i) => i.label),
    button,
  )
  return (
    <Box
      id="scroll-list"
      display="flex"
      justifyContent="start"
      position="relative"
      flexDirection="row"
      alignItems="start"
      alignContent="stretch"
      borderSize={button.padding}
      borderColor={button.color}
      onWheelDown={(e) => {
        if (startIndex + maxItemCount < items.length) {
          setStartIndex(startIndex + 1)
        }
      }}
      onWheelUp={(e) => {
        if (startIndex > 0) {
          setStartIndex(startIndex - 1)
        }
      }}
    >
      {showScrollBar && (
        <Box
          position="absolute"
          id={"scroll-bar"}
          top={scrollBarTop}
          right={0}
          width={button.padding * 2}
          height={scrollBarHeight}
          backgroundColor={button.color}
        />
      )}
      {visibleList.map(({ key, label, onClick }, k) => {
        return (
          <Button
            id={"scroll-list-" + key}
            key={key}
            text={label}
            width={max + button.padding * 2}
            height={button.height}
            enableMouseStyle={mouseHoverStyle}
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            onClick={onClick}
          ></Button>
        )
      })}
    </Box>
  )
})
