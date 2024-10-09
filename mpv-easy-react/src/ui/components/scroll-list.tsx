import {
  Box,
  Button,
  type ButtonProps,
  createNode,
  MpDom,
  type MpDomProps,
} from "@mpv-easy/react"
import React, { useRef, useState } from "react"
import { useSelector } from "react-redux"
import {
  buttonStyleSelector,
  fontSizeSelector,
  mouseHoverStyleSelector,
  scrollListStyleSelector,
} from "../../store"
import { measureText, type MouseEvent } from "@mpv-easy/react"
import { getOsdSize } from "@mpv-easy/tool"

export type ScrollListProps = {
  items: {
    key: string
    label: string
    onClick: (e: MouseEvent) => void
    showTitle: boolean
  }[]
}

const MaxWidthCache: Record<string, number> = {}
const MaxWidthDomCache: MpDom[] = []

function getMaxWidth(
  textList: string[],
  button: Partial<ButtonProps>,
  parent?: MpDom | null | undefined,
) {
  const size = getOsdSize()
  const cacheKey = `${JSON.stringify(size)}\n${textList.join("\n")}`

  if (MaxWidthCache[cacheKey]) {
    return MaxWidthCache[cacheKey]
  }

  while (MaxWidthDomCache.length < textList.length) {
    MaxWidthDomCache.push(createNode("@mpv-easy/box"))
  }

  let max = 0
  for (let i = 0; i < textList.length; i++) {
    const text = textList[i]
    const node = MaxWidthDomCache[i]
    node.attributes = button
    node.attributes.text = text
    max = Math.max(max, measureText(node).width)
    if (parent) {
      node.parentNode = parent
    }
  }
  MaxWidthCache[cacheKey] = max
  return max
}

export const ScrollList = ({
  items,
  ...props
}: ScrollListProps & Partial<MpDomProps>) => {
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
  const ref = useRef<MpDom | null>(null)

  const max = getMaxWidth(
    items.map((i) => i.label),
    button,
    ref.current,
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
      ref={ref}
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
      {visibleList.map(({ key, label, onClick, showTitle }) => {
        return (
          <Button
            id={`scroll-list-${key}`}
            title={showTitle ? key : ""}
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
}
