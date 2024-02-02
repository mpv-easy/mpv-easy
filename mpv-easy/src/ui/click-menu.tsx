import {
  MousePos,
  PropertyBool,
  PropertyNative,
  addForcedKeyBinding,
  addKeyBinding,
  command,
  getOsdSize,
  todo,
} from "@mpv-easy/tool"
import {
  BaseElementProps,
  DOMElement,
  Box,
  computeTooltipPosition,
  getDirection,
  Button,
} from "@mpv-easy/ui"
import { RootNode } from "@mpv-easy/ui/src/render/flex"
import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  buttonStyleSelector,
  clickMenuStyleSelector,
  mouseHoverStyleSelector,
  Dispatch,
  i18nSelector,
  pauseSelector,
  anime4kSelector,
} from "../store"

export interface MenuItem {
  key: string
  label: string
  children?: MenuItem[]
  onSelect?: (item: MenuItem) => void
}

export type ClickMenuProps = {}

const mousePosProp = new PropertyNative<MousePos>("mouse-pos")
const pauseProp = new PropertyBool("pause")

export const ClickMenu = React.forwardRef<
  {
    setHide: (v: boolean) => void
  },
  Partial<BaseElementProps>
>((props, ref) => {
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [childMenuPos, setChildMenuPos] = useState({ x: 0, y: 0 })
  const [hide, setHide] = useState(true)
  const dispatch = useDispatch<Dispatch>()
  const pause = useSelector(pauseSelector)
  const i18n = useSelector(i18nSelector)
  const anime4k = useSelector(anime4kSelector)
  function getClickMenuItems(): MenuItem[] {
    return [
      {
        key: "open",
        label: "open",
        onSelect: () => {
          todo()
        },
      },

      {
        key: pause ? i18n.play : i18n.pause,
        label: pause ? i18n.play : i18n.pause,
        onSelect: () => {
          dispatch.context.setPause(!pause)
        },
      },
      {
        key: "playlist",
        label: "playlist",
        onSelect: () => {
          dispatch.context.setPlaylistHide(false)
        },
      },
      {
        key: "anime4k",
        label: "anime4k",
        children: anime4k.shaders.map((i) => {
          return {
            key: i.key,
            label: i.title,
            onSelect: () => {
              const { value, title } = i
              if (value.length) {
                command(
                  `${
                    anime4k.noOsd ? "no-osd" : ""
                  } change-list glsl-shaders set "${value}"; show-text "${title}"`,
                )
              } else {
                command(
                  `${
                    anime4k.noOsd ? "no-osd" : ""
                  }  change-list glsl-shaders clr ""; show-text "${title}"`,
                )
              }
            },
          }
        }),
      },
      {
        key: i18n.skin,
        label: i18n.skin,
        children: [
          {
            key: i18n.osc,
            label: i18n.osc,
            onSelect: () => {
              dispatch.context.setUI("osc")
            },
          },
          {
            key: i18n.uosc,
            label: i18n.uosc,
            onSelect: () => {
              dispatch.context.setUI("uosc")
            },
          },
        ],
      },
      {
        key: i18n.theme,
        label: i18n.theme,
        children: [
          {
            key: i18n.lightName,
            label: i18n.lightName,
            onSelect: () => {
              dispatch.context.setMode("light")
            },
          },
          {
            key: i18n.darkName,
            label: i18n.darkName,
            onSelect: () => {
              dispatch.context.setMode("dark")
            },
          },
        ],
      },
      {
        key: i18n.exit,
        label: i18n.exit,
        onSelect: () => {
          dispatch.context.exit()
        },
      },
    ]
  }

  const items = getClickMenuItems()
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | undefined>(
    undefined,
  )

  const menuRef = useRef<DOMElement>(null)
  const childMenuRef = useRef<DOMElement>(null)
  const button = useSelector(buttonStyleSelector)
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const clickMenu = useSelector(clickMenuStyleSelector)

  const [childMenuHide, setChildMenuHide] = useState(true)

  React.useImperativeHandle(ref, () => ({
    setHide() {
      setHide(true)
      setChildMenuHide(true)
    },
  }))

  useEffect(() => {
    addKeyBinding(
      "MOUSE_BTN2",
      "MOUSE_BTN2_CLICK_MENU",
      () => {
        if (!menuRef.current) {
          setHide(true)
          return
        }

        const mousePos = mousePosProp.value
        const direction = getDirection(
          mousePos.x,
          mousePos.y,
          RootNode.layoutNode.width,
          RootNode.layoutNode.height,
        )
        const pos = computeTooltipPosition(
          menuRef.current,
          mousePos.x,
          mousePos.y,
          direction,
        )
        // console.log(direction)
        setMenuPos(pos)
        setHide(false)
        setChildMenuHide(true)
      },
      {
        forced: true,
      },
    )
  }, [])
  return (
    <>
      <Box
        id="click-menu-main"
        hide={hide}
        ref={menuRef}
        position="relative"
        x={menuPos.x}
        y={menuPos.y}
        // onBlur={() => {
        //   setTimeout(() => {
        //     setHide(true)
        //     setChildMenuHide(true)
        //   }, 16)
        // }}
        display="flex"
        flexDirection="row"
        alignContent="stretch"
        justifyContent="start"
        alignItems="start"
        backgroundColor={clickMenu.backgroundColor}
        zIndex={clickMenu.zIndex}
        // onMouseDown={(e) => {
        //   console.log("======click-menu-main", e.target.attributes.id)
        //   e.stopPropagation()
        // }}
      >
        {items.map((i, k) => {
          return (
            <Button
              zIndex={clickMenu.zIndex + 2}
              id={"click-menu-" + i.key}
              key={i.key}
              text={i.label}
              enableMouseStyle={mouseHoverStyle}
              padding={button.padding}
              colorHover={button.colorHover}
              backgroundColorHover={button.backgroundColorHover}
              backgroundColor={button.backgroundColor}
              font={button.font}
              fontSize={button.fontSize}
              color={button.color}
              onMouseDown={(e) => {
                e.stopPropagation()
                console.log("menu click", i.key)
                console.log("child-menu click", i.key, e.target.attributes.id)
                i.onSelect?.(i)
                setChildMenuHide(false)

                if (i.children?.length) {
                  setSelectedMenu(i)
                  const { x, y, width, height } = e.target.layoutNode
                  // console.log('menu item: ', x, y, width,)
                  setChildMenuPos({ x: x + width, y: y })
                } else {
                  setTimeout(() => {
                    setHide(true)
                    setSelectedMenu(undefined)
                  }, 16)
                }
              }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              alignContent="stretch"
              alignItems="start"
              postfix={i.children?.length ? ">" : undefined}
            />
          )
        })}
      </Box>
      {!childMenuHide ? (
        <Box
          id="click-child-menu-main"
          hide={hide}
          ref={childMenuRef}
          position="relative"
          x={childMenuPos.x}
          y={childMenuPos.y}
          // onBlur={() => {
          //   setTimeout(() => {
          //     setHide(true)
          //     setChildMenuHide(true)
          //   }, 16)
          // }}
          display="flex"
          flexDirection="row"
          alignContent="stretch"
          justifyContent="start"
          alignItems="start"
          backgroundColor={clickMenu.backgroundColor}
          zIndex={clickMenu.zIndex + 100}
          onMouseDown={(e) => {
            console.log("======click-menu-main", e.target.attributes.id)
            e.stopPropagation()
          }}
        >
          {(selectedMenu?.children ?? []).map((i) => {
            return (
              <Button
                zIndex={clickMenu.zIndex + 200}
                id={"click-child-menu-" + i.key}
                key={i.key}
                text={i.label}
                enableMouseStyle={mouseHoverStyle}
                padding={button.padding}
                colorHover={button.colorHover}
                backgroundColorHover={button.backgroundColorHover}
                backgroundColor={button.backgroundColor}
                font={button.font}
                fontSize={button.fontSize}
                color={button.color}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  console.log("child-menu click", i.key, e.target.attributes.id)
                  i.onSelect?.(i)
                  setChildMenuHide(true)
                  setHide(true)
                }}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignContent="stretch"
                alignItems="start"
              />
            )
          })}
        </Box>
      ) : (
        <></>
      )}
    </>
  )
})
