import {
  Box,
  Button,
  type ButtonProps,
  createNode,
  MpDom,
  type MpDomProps,
} from "@mpv-easy/react"
import React, { useRef, useState } from "react"
import {
  buttonStyleSelector,
  cellSizeSelector,
  fontSelector,
  mouseHoverStyleSelector,
  normalFontSizeSelector,
  osdDimensionsSelector,
  scrollListStyleSelector,
} from "../../store"
import { measureText, type MouseEvent } from "@mpv-easy/react"
import { getOsdSize } from "@mpv-easy/tool"
import { useSelector } from "../../models"

export type ScrollListProps = {
  items: {
    key: string
    label: string
    onClick: (e: MouseEvent) => void
    showTitle: boolean
    title: string
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

  // if (MaxWidthCache[cacheKey]) {
  //   return MaxWidthCache[cacheKey]
  // }

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
  const osd = useSelector(osdDimensionsSelector)
  const [startIndex, setStartIndex] = useState(0)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const normalFontSize = useSelector(normalFontSizeSelector)
  const cellSize = useSelector(cellSizeSelector)
  const font = useSelector(fontSelector)
  const maxItemCount = Math.min(
    scrollListStyle.maxItemCount,
    (osd.h / 2 / cellSize) | 0,
  )
  const showScrollBar = maxItemCount < items.length
  const scrollListVisibleHeight =
    maxItemCount * (cellSize + normalFontSize.padding * 2) +
    normalFontSize.padding * 2
  const scrollBarHeight = showScrollBar
    ? (maxItemCount / items.length) * scrollListVisibleHeight
    : 0
  const scrollBarSpace = scrollListVisibleHeight - scrollBarHeight
  const offset = scrollBarSpace / (items.length - maxItemCount)
  const scrollBarTop = normalFontSize.padding + startIndex * offset
  const visibleList = items.slice(startIndex, startIndex + maxItemCount)
  const ref = useRef<MpDom | null>(null)

  const max =
    getMaxWidth(
      items.map((i) => i.label),
      {
        fontSize: normalFontSize.fontSize,
        // padding: normalFontSize.padding,
        padding: 0,
        font,
        height: cellSize,
        ...button,
      },
      ref.current,
    ) +
    // hack: allow some measurement error to ensure that the width can accommodate all the text
    normalFontSize.padding * 2

  return (
    <Box
      id="scroll-list"
      display="flex"
      justifyContent="center"
      position="relative"
      flexDirection="row"
      alignItems="start"
      padding={normalFontSize.padding}
      borderSize={normalFontSize.padding}
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
          width={normalFontSize.padding}
          height={scrollBarHeight}
          backgroundColor={button.color}
        />
      )}
      {visibleList.map(({ key, label, title, onClick, showTitle }) => {
        return (
          <Button
            id={`scroll-list-${key}`}
            title={showTitle ? title : ""}
            key={key}
            text={label}
            width={max + normalFontSize.padding * 2}
            height={cellSize}
            enableMouseStyle={mouseHoverStyle}
            padding={normalFontSize.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            backgroundColor={button.backgroundColor}
            font={font}
            fontSize={normalFontSize.fontSize}
            color={button.color}
            onClick={onClick}
          />
        )
      })}
    </Box>
  )
}
