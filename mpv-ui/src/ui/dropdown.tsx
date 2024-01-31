import React, { useRef, useState } from "react"
import { Button, ButtonProps } from "./button"
import { Box } from "./box"
import { DOMElement } from "../render"
import { isEvent } from "../common"

export type DropdownItem = {
  key: string | number
  label: string
  selected?: boolean
  onSelect?: (item: DropdownItem) => void
}

export type DropdownDirection = "top" | "bottom"

export type DropdownProps = {
  items: DropdownItem[]
  direction: DropdownDirection
  dropdownStyle: Partial<ButtonProps>
}

function getProps(props: any) {
  const newProps: any = {}
  for (const i in props) {
    if (
      isEvent(i) ||
      ["width", "height", "x", "y", "left", "right", "top", "bottom"].includes(
        i,
      )
    ) {
      continue
    }
    newProps[i] = props[i]
  }
  return newProps
}

export const Dropdown = React.forwardRef<
  DOMElement,
  Partial<ButtonProps & DropdownProps>
>((props) => {
  const buttonRef = useRef<DOMElement>(null)
  const [show, setShow] = useState(false)
  const { items = [], direction = "bottom" } = props
  const newProps = getProps(props)
  const { dropdownStyle = {} } = props
  const offsetProps = direction === "top" ? { bottom: "100%" } : { top: "100%" }
  return (
    <>
      <Button
        {...props}
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
        {show ? (
          <Box
            id="dropdown-list"
            display="flex"
            flexDirection="row"
            justifyContent="start"
            alignItems="start"
            {...offsetProps}
            alignContent="stretch"
          >
            {items.map((i) => {
              return (
                <Button
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
                ></Button>
              )
            })}
          </Box>
        ) : (
          <></>
        )}
      </Button>
    </>
  )
})
