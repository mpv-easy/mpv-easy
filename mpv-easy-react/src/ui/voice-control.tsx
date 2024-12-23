import { type MpDomProps, Box, type MpDom } from "@mpv-easy/react"
import React, {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  useState,
} from "react"
import {
  volumeMaxSelector,
  volumeSelector,
  buttonStyleSelector,
  volumeStyleSelector,
  osdDimensionsSelector,
  smallFontSizeSelector,
  cellSizeSelector,
  fontSelector,
  normalFontSizeSelector,
} from "../store"
import { clamp, setPropertyNumber } from "@mpv-easy/tool"
import { Mute } from "./components/mute"
import { dispatch, useSelector } from "../models"

export const VoiceControl: ForwardRefExoticComponent<
  PropsWithoutRef<Partial<MpDomProps>> & RefAttributes<MpDom>
> = React.forwardRef<MpDom, Partial<MpDomProps>>((props, ref) => {
  const volume = useSelector(volumeSelector)
  const volumeMax = useSelector(volumeMaxSelector)
  const button = useSelector(buttonStyleSelector)
  const volumeStyle = useSelector(volumeStyleSelector)
  const volumeHeight = volume / volumeMax
  const osdH = useSelector(osdDimensionsSelector).h
  const fontSize = useSelector(normalFontSizeSelector)
  const iconSize = fontSize.fontSize
  const boxCount = 5
  const smallFontSize = useSelector(normalFontSizeSelector)
  const boxHeight = iconSize * boxCount
  const wrapHeight =
    boxHeight + 2 * iconSize + 2 * fontSize.padding + fontSize.fontSize

  const wrapTop = (osdH - wrapHeight) / 2
  const [previewHide, setPreviewHide] = useState(true)
  const [previewBottom, setPreviewBottom] = useState(0)
  const font = useSelector(fontSelector)

  const previewColor =
    previewBottom + volumeStyle.previewCursorSize / 2 / boxHeight > volumeHeight
      ? button.color
      : volumeStyle.backgroundColor
  // FIXME: make icon button can hold three-digit numbers like 100
  const volumeFontSize = (smallFontSize.fontSize * 0.75) & ~7
  return (
    osdH > wrapHeight && (
      <Box
        id="voice-control"
        top={wrapTop}
        right={0}
        width={iconSize + 2 * fontSize.padding}
        height={wrapHeight}
        onWheelDown={() => {
          const v = clamp(volume - volumeStyle.step, 0, volumeMax)
          dispatch.setVolume(v)
          // setPropertyNumber("volume", v)
        }}
        onWheelUp={() => {
          const v = clamp(volume + volumeStyle.step, 0, volumeMax)
          dispatch.setVolume(v)
          // setPropertyNumber("volume", v)
        }}
        position="relative"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        padding={fontSize.padding}
        backgroundColor={volumeStyle.backgroundColor}
        {...props}
        ref={ref}
        hide={props.hide}
        zIndex={volumeStyle.zIndex}
        font={font}
      >
        <Box
          id="voice-control-volume"
          fontSize={volumeFontSize}
          text={volume.toFixed(0).toString()}
          width={iconSize}
          height={iconSize}
          color={button.color}
          padding={fontSize.padding}
          display="flex"
          justifyContent="center"
          alignItems="center"
        />
        <Box
          id="voice-control-box"
          height={boxHeight}
          width={fontSize.fontSize - fontSize.padding * 2}
          display="flex"
          position="relative"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          borderSize={fontSize.padding}
          borderColor={button.color}
          zIndex={volumeStyle.zIndex + 2}
          onMouseDown={(e) => {
            setPreviewHide(false)
            const v =
              ((1 - e.offsetY / (e.target?.layoutNode.height || 0)) *
                volumeMax) |
              0
            const newVolume = clamp(v, 0, volumeMax)
            dispatch.setVolume(newVolume)
            // setPropertyNumber("volume", newVolume)
          }}
          onMouseEnter={() => {
            setPreviewHide(false)
          }}
          onMouseMove={(e) => {
            const height = e.target?.layoutNode.height || 0
            const v = ((1 - e.offsetY / height) * volumeMax) | 0
            const newVolume = clamp(v, 0, volumeMax)
            setPreviewHide(false)
            setPreviewBottom(
              newVolume / volumeMax -
                volumeStyle.previewCursorSize / 2 / height,
            )
          }}
          onMouseLeave={(e) => {
            setPreviewHide(true)
          }}
        >
          <Box
            id="voice-control-box-inner"
            pointerEvents="none"
            height={`${volumeHeight * 100}%`}
            bottom={0}
            left={0}
            width={iconSize}
            backgroundColor={button.color}
            position="absolute"
            zIndex={volumeStyle.zIndex + 1}
          />

          {previewHide || (
            <Box
              id="voice-control-cursor"
              pointerEvents="none"
              height={volumeStyle.previewCursorSize}
              left={0}
              bottom={`${previewBottom * 100}%`}
              width={iconSize}
              position="absolute"
              backgroundColor={previewColor}
              zIndex={volumeStyle.zIndex + 16}
            />
          )}
        </Box>
        <Mute />
      </Box>
    )
  )
})
