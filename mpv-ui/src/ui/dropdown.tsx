import React, { useRef, useState } from "react"
import { Button, type ButtonProps } from "./button"
import { Box } from "./box"
import { EventName } from "@r-tui/flex"
import type { MpDom } from "../render/dom"

export type DropdownItem = {
  key: string | number
  label?: string
  selected?: boolean
  onSelect?: (item: DropdownItem) => void
  style?: Partial<ButtonProps>
}

export type DropdownDirection = "top" | "bottom"

export type DropdownProps = {
  items: DropdownItem[]
  direction: DropdownDirection
  dropdownStyle: Partial<ButtonProps>
  dropdownWrapStyle: Partial<ButtonProps>
}

function getProps(props: any) {
  const newProps: any = {}
  for (const i in props) {
    if (
      EventName.find(x => x === i) ||
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
  const { dropdownStyle = {} } = props
  const offsetProps = direction === "top" ? { bottom: "100%" } : { top: "100%" }

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
          >
            {items.map((i) => {
              return (
                <Button
                  position="relative"
                  {...newProps}
                  {...dropdownStyle}
                  width={undefined}
                  id={i.key}
                  key={i.key}
                  text={i.label}
                  onMouseDown={() => {
                    i.onSelect?.(i)
                    setShow(false)
                  }}
                  {...(i.style ?? {})}
                />
              )
            })}
          </Box>
        )}
      </Button>
    </>
  )
}
