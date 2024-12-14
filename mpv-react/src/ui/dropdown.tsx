import React, { useRef, useState } from "react"
import { Button, type ButtonProps } from "./button"
import { Box } from "./box"
import {
  MpDomProps,
  type MpAttrs,
  type MpDom,
  type MpEvent,
  type MpProps,
} from "../flex"
import { type BaseMouseEvent, EventNameList } from "@mpv-easy/flex"

export type DropdownItem = {
  key: string | number
  label?: string
  selected?: boolean
  onSelect?: (
    item: DropdownItem,
    e: BaseMouseEvent<MpAttrs, MpProps, MpEvent>,
  ) => void
  style?: Partial<ButtonProps>
}

export type DropdownDirection = "top" | "bottom"

export type DropdownProps = {
  items: DropdownItem[]
  direction?: DropdownDirection
  dropdownStyle?: Partial<ButtonProps>
  dropdownListStyle?: Partial<ButtonProps>
  maxItemCount?: number
  pageDown?: {
    style: Partial<ButtonProps>
    text: string
  }
  pageUp?: {
    style: Partial<ButtonProps>
    text: string
  }
} & ButtonProps

function getProps(props: any) {
  const newProps: any = {}
  for (const i in props) {
    if (
      EventNameList.find((x) => x === i) ||
      [
        "width",
        "height",
        "x",
        "y",
        "left",
        "right",
        "top",
        "bottom",
        "title",
      ].includes(i)
    ) {
      continue
    }
    newProps[i] = props[i]
  }
  return newProps
}

export const Dropdown = (props: Partial<ButtonProps & DropdownProps>) => {
  const buttonRef = useRef<MpDom>(null)
  const [show, setShow] = useState(false)
  const { items = [], direction = "bottom" } = props
  const newProps = getProps(props)
  const {
    dropdownStyle = {},
    dropdownListStyle = {},
    maxItemCount = 6,
    pageDown,
    pageUp,
  } = props
  const offsetProps = direction === "top" ? { bottom: "100%" } : { top: "100%" }

  const showPage = items.length > maxItemCount
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(items.length / maxItemCount)
  const pageStart = maxItemCount * page
  const pageEnd = pageStart + maxItemCount

  const showItems = items.slice(pageStart, pageEnd)

  return (
    <>
      <Button
        {...props}
        {...dropdownStyle}
        ref={buttonRef}
        onMouseDown={(e) => {
          setShow((c) => !c)
          props.onMouseDown?.(e)
        }}
        onBlur={(e) => {
          // TODO: hack, ensure children's onSelect exec first
          setTimeout(() => {
            setShow(false)
            props.onBlur?.(e)
          }, 16)
        }}
      >
        {show && (
          <Box
            id="dropdown-list"
            display="flex"
            flexDirection="row"
            justifyContent="start"
            alignItems="start"
            {...offsetProps}
            alignContent="stretch"
            color={props.color}
            backgroundColor={props.backgroundColor}
            {...dropdownListStyle}
          >
            {showPage && (
              <Button
                id="dropdown-list-page-up"
                position="relative"
                {...newProps}
                {...dropdownStyle}
                width={undefined}
                key={"dropdown-up"}
                text={pageUp?.text}
                {...pageUp?.style}
                onMouseDown={(e) => {
                  const p = (page - 1 + pageCount) % pageCount
                  setPage(p)
                  e.stopPropagation()
                }}
              />
            )}
            {showItems.map((i) => {
              return (
                <Button
                  position="relative"
                  {...newProps}
                  {...dropdownStyle}
                  width={undefined}
                  id={i.key}
                  key={i.key}
                  text={i.label}
                  onMouseDown={(e) => {
                    i.onSelect?.(i, e)
                    setShow(false)
                  }}
                  {...i.style}
                />
              )
            })}
            {showPage && (
              <Button
                id="dropdown-list-page-down"
                position="relative"
                {...newProps}
                {...dropdownStyle}
                width={undefined}
                key={"dropdown-down"}
                {...pageDown?.style}
                text={pageDown?.text}
                onMouseDown={(e) => {
                  const p = (page + 1) % pageCount
                  setPage(p)
                  e.stopPropagation()
                }}
              />
            )}
          </Box>
        )}
      </Button>
    </>
  )
}
