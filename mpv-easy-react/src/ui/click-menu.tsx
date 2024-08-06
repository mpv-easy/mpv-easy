import {
  type MousePos,
  PropertyNative,
  addKeyBinding,
  clamp,
  command,
  getOs,
  getPropertyString,
  openDialog,
  osdMessage,
  setClipboard,
  setPropertyNumber,
} from "@mpv-easy/tool"
import {
  type MpDomProps,
  type MpDom,
  Box,
  computeTooltipPosition,
  getDirection,
  Button,
  type ButtonProps,
} from "@mpv-easy/react"
import { getRootNode } from "@mpv-easy/react"
import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  useEffect,
  useRef,
  useState,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  buttonStyleSelector,
  clickMenuStyleSelector,
  mouseHoverStyleSelector,
  type Dispatch,
  i18nSelector,
  pauseSelector,
  anime4kSelector,
  languageSelector,
  modeSelector,
  uiNameSelector,
  enablePluginsStyleSelector,
  speedSelector,
  speedListSelector,
  fontSizeSelector,
} from "../store"
import * as ICON from "../icon"
import { pluginName as anime4kName } from "@mpv-easy/anime4k"
import { ThemeModeList, UINameList } from "../mpv-easy-theme"
import { getMaxStringLength } from "../common"
import { LanguageList } from "@mpv-easy/i18n"
export interface MenuItem {
  key: string
  label: string
  children?: MenuItem[]
  onSelect?: (item: MenuItem) => void
  style?: Partial<ButtonProps>
}

const mousePosProp = new PropertyNative<MousePos>("mouse-pos")

export const ClickMenu: ForwardRefExoticComponent<
  PropsWithoutRef<Partial<MpDomProps>> &
    RefAttributes<{
      setHide: (v: boolean) => void
    }>
> = React.forwardRef<
  {
    setHide: (v: boolean) => void
  },
  Partial<MpDomProps>
>((props: Partial<MpDomProps>, ref) => {
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [childMenuPos, setChildMenuPos] = useState({ x: 0, y: 0 })
  const [hide, setHide] = useState(true)
  const dispatch = useDispatch<Dispatch>()
  const pause = useSelector(pauseSelector)
  const i18n = useSelector(i18nSelector)
  const anime4k = useSelector(anime4kSelector)
  const speed = useSelector(speedSelector)
  const speedList = useSelector(speedListSelector)

  const language = useSelector(languageSelector)

  const mode = useSelector(modeSelector)

  const uiName = useSelector(uiNameSelector)

  const enablePlugins = useSelector(enablePluginsStyleSelector)

  const minFontSize = 12
  const maxFontSize = 120
  const fontStep = 12
  const fontSize = useSelector(fontSizeSelector)

  function getClickMenuItems(): MenuItem[] {
    const os = getOs()
    const platformItems: MenuItem[] = []

    if (os === "windows") {
      platformItems.push({
        key: i18n.open,
        label: i18n.open,
        onSelect: () => {
          const v = openDialog()[0]
          if (v) {
            dispatch.context.playVideo(v)
          }
        },
      })
    }

    const pluginItems: MenuItem[] = []

    if (enablePlugins[anime4kName]) {
      pluginItems.push({
        key: "anime4k",
        label: "anime4k",
        children: anime4k.shaders.map((i, k) => {
          const prefix =
            k === anime4k.current ? ICON.Ok : ICON.CheckboxBlankCircleOutline
          return {
            key: i.key,
            label: `${prefix} ${i.title}`,
            onSelect: () => {
              const { value, title } = i
              if (value.length) {
                command(`no-osd change-list glsl-shaders set "${value}";`)
                if (anime4k.osdDuration) {
                  osdMessage(title, anime4k.osdDuration)
                }
              } else {
                command(`no-osd change-list glsl-shaders clr "";`)
                if (anime4k.osdDuration) {
                  osdMessage(title, anime4k.osdDuration)
                }
              }
              anime4k.current = k
              dispatch.context.setAnime4k(anime4k)
            },
          }
        }),
      })
    }

    const systemItems: MenuItem[] = [
      {
        key: i18n.style,
        label: i18n.style,
        children: [
          {
            key: i18n.enlargeFontSize,
            label: i18n.enlargeFontSize,
            onSelect() {
              const s = clamp(fontSize + fontStep, minFontSize, maxFontSize)
              dispatch.context.setFontSize(s)
            },
          },
          {
            key: i18n.reduceFontSize,
            label: i18n.reduceFontSize,
            onSelect() {
              const s = clamp(fontSize - fontStep, minFontSize, maxFontSize)
              dispatch.context.setFontSize(s)
            },
          },
        ],
      },
      {
        key: i18n.language,
        label: i18n.language,
        children: LanguageList.map((i) => {
          const prefix =
            language === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline
          const maxLen = getMaxStringLength(LanguageList)
          return {
            key: i18n.languageChinese,
            label: `${prefix} ${i18n[i].padEnd(maxLen)}`,
            onSelect: () => {
              dispatch.context.setLanguage(i)
            },
          }
        }),
      },
      {
        key: i18n.more,
        label: i18n.more,
        children: [
          {
            key: i18n.console,
            label: i18n.console,
            onSelect() {
              command("script-message-to console type")
            },
          },
          {
            key: i18n.copyPath,
            label: i18n.copyPath,
            onSelect() {
              const path = getPropertyString("path")
              if (path && setClipboard(path)) {
                osdMessage("copy path to clipboard", 5)
              }
            },
          },
          {
            key: i18n.resetConfig,
            label: i18n.resetConfig,
            onSelect() {
              dispatch.context.resetConfig()
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
    const commonItems: MenuItem[] = [
      {
        key: pause ? i18n.play : i18n.pause,
        label: pause ? i18n.play : i18n.pause,
        onSelect: () => {
          dispatch.context.setPause(!pause)
        },
      },
      {
        key: i18n.playlist,
        label: i18n.playlist,
        onSelect: () => {
          dispatch.context.setPlaylistHide(false)
        },
      },
      {
        key: i18n.theme,
        label: i18n.theme,
        children: ThemeModeList.map((i): MenuItem => {
          const prefix = mode === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline
          const maxLen = getMaxStringLength(ThemeModeList.map((i) => i18n[i]))
          const label = `${prefix} ${i18n[i].padStart(maxLen, " ")}`

          return {
            key: i,
            label: label,
            onSelect: () => {
              dispatch.context.setMode(i)
            },
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
          }
        }),
      },
      {
        key: i18n.skin,
        label: i18n.skin,
        children: UINameList.map((i): MenuItem => {
          const maxLen = getMaxStringLength(UINameList)
          const prefix =
            uiName === i ? ICON.Ok : ICON.CheckboxBlankCircleOutline
          const label = `${prefix} ${i18n[i].padEnd(maxLen, " ")}`
          return {
            key: i,
            label,
            onSelect: () => {
              dispatch.context.setUI(i)
            },
            style: {
              justifyContent: "space-between",
              alignItems: "center",
            },
          }
        }),
      },
      {
        key: i18n.videoSpeed,
        label: i18n.videoSpeed,
        children: speedList.map((i) => {
          const prefix = i === speed ? ICON.Ok : ICON.CheckboxBlankCircleOutline
          return {
            key: `${i18n.videoSpeed}-${i}`,
            label: `${prefix} ${i.toString()}`,
            onSelect: () => {
              if (speed !== i) {
                dispatch.context.setSpeed(i)
                setPropertyNumber("speed", i)
              }
            },
          }
        }),
      },
    ]

    return [...platformItems, ...commonItems, ...pluginItems, ...systemItems]
  }

  const items = getClickMenuItems()
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | undefined>(
    undefined,
  )

  const menuRef = useRef<MpDom>(null)
  const childMenuRef = useRef<MpDom>(null)
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
          getRootNode().layoutNode.width,
          getRootNode().layoutNode.height,
        )
        const pos = computeTooltipPosition(
          menuRef.current,
          mousePos.x,
          mousePos.y,
          direction,
        )
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
        display="flex"
        flexDirection="row"
        alignContent="stretch"
        justifyContent="start"
        alignItems="start"
        backgroundColor={clickMenu.backgroundColor}
        zIndex={clickMenu.zIndex}
      >
        {items.map((i, k) => {
          return (
            <Button
              id={`click-menu-${i.key}`}
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
              height={button.fontSize}
              onMouseDown={(e) => {
                e.stopPropagation()
                i.onSelect?.(i)
                setChildMenuHide(false)

                if (i.children?.length) {
                  setSelectedMenu(i)
                  const {
                    x = 0,
                    y = 0,
                    width = 0,
                    height = 0,
                  } = e.target?.layoutNode || {}
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
              alignItems="start"
              postfix={i.children?.length ? ">" : undefined}
            />
          )
        })}
      </Box>
      {
        <Box
          id="click-child-menu-main"
          hide={hide || childMenuHide}
          ref={childMenuRef}
          position="relative"
          x={childMenuPos.x}
          y={childMenuPos.y}
          // padding={button.padding}
          font={button.font}
          fontSize={button.fontSize}
          color={button.color}
          display="flex"
          flexDirection="row"
          justifyContent="start"
          alignItems="start"
          alignContent="stretch"
          backgroundColor={clickMenu.backgroundColor}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
        >
          {(selectedMenu?.children ?? []).map((i) => {
            return (
              <Button
                id={`click-child-menu-${i.key}`}
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
                height={button.fontSize}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  i.onSelect?.(i)
                  setChildMenuHide(true)
                  setHide(true)
                }}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="start"
                {...i.style}
              />
            )
          })}
        </Box>
      }
    </>
  )
})
