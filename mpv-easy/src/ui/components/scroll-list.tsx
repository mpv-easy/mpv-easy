import { getFileName, command, clamp } from "@mpv-easy/tool"
import {
  Box,
  Button,
  MouseEvent,
  // DOMElement,
  ButtonProps,
  createNode,
  BaseElementProps,
  lenToNumber,
  DOMElement,
} from "@mpv-easy/ui"
import React, { useRef, useState } from "react"
import { useSelector } from "react-redux"
import {
  buttonStyleSelector,
  fontSizeSelector,
  mouseHoverStyleSelector,
  osdDimensionsSelector,
  scrollListStyleSelector,
  smallFontSizeSelector,
} from "../../store"
import { measureText } from "@mpv-easy/ui"

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

export const ScrollList = React.memo(
  ({ items, ...props }: ScrollListProps & Partial<BaseElementProps>) => {
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
      button.padding * 2 +
      (startIndex / (items.length - maxItemCount)) * scrollBarSpace
    const visibleList = items.slice(startIndex, startIndex + maxItemCount)
    const max = getMaxWidth(
      items.map((i) => i.label),
      button,
    )

    const fontSize = useSelector(fontSizeSelector)
    return (
      <Box
        id="scroll-list"
        display="flex"
        justifyContent="center"
        position="relative"
        flexDirection="row"
        alignItems="start"
        padding={button.padding}
        borderSize={button.padding}
        borderColor={button.backgroundColorHover}
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
        zIndex={props.zIndex}
      >
        {showScrollBar && (
          <Box
            position="absolute"
            id={"scroll-bar"}
            top={scrollBarTop}
            right={0}
            width={button.padding}
            height={scrollBarHeight}
            backgroundColor={button.color}
          />
        )}
        {visibleList.map(({ key, label, onClick }, k) => {
          return (
            <Button
              id={`scroll-list-${key}`}
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
              fontSize={fontSize}
              color={button.color}
              onClick={onClick}
            />
          )
        })}
      </Box>
    )
  },
)
