import { setPropertyNumber } from "../../../mpv-tool/src/mpv"
import { BaseElementProps, Box, DOMElement } from "@mpv-easy/ui"
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  volumeMaxSelector,
  volumeSelector,
  Dispatch,
  buttonStyleSelector,
  volumeStyleSelector,
  osdDimensionsSelector,
  smallFontSizeSelector,
} from "../store"
import { clamp } from "@mpv-easy/tool"
import { Mute } from "./components/mute"

export const VoiceControl = React.memo(
  React.forwardRef<DOMElement, Partial<BaseElementProps>>((props = {}, ref) => {
    const volume = useSelector(volumeSelector)
    const volumeMax = useSelector(volumeMaxSelector)
    const dispatch = useDispatch<Dispatch>()
    const button = useSelector(buttonStyleSelector)
    const volumeStyle = useSelector(volumeStyleSelector)
    const volumeHeight = volume / volumeMax
    const h = useSelector(osdDimensionsSelector).h
    const boxCount = 5
    const boxHeight = button.height * boxCount
    const wrapHeight =
      boxHeight +
      (button.height + button.padding) * 2 +
      2 * button.padding * boxCount
    const wrapTop = (h - wrapHeight) / 2
    const [previewHide, setPreviewHide] = useState(true)
    const [previewBottom, setPreviewBottom] = useState(0)
    const fontSize = useSelector(smallFontSizeSelector)

    const previewColor = previewBottom +
      volumeStyle.previewCursorSize / 2 / boxHeight >
      volumeHeight
      ? button.color
      : volumeStyle.backgroundColor

    return (
      h > wrapHeight && (
        <Box
          id='voice-control'
          top={wrapTop}
          right={0}
          width={button.width + 4 * button.padding}
          height={wrapHeight}
          onWheelDown={() => {
            const v = clamp(volume - volumeStyle.step, 0, volumeMax)
            dispatch.context.setVolume(v)
            setPropertyNumber("volume", v)
          }}
          onWheelUp={() => {
            const v = clamp(volume + volumeStyle.step, 0, volumeMax)
            dispatch.context.setVolume(v)
            setPropertyNumber("volume", v)
          }}
          position="relative"
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          padding={button.padding}
          backgroundColor={volumeStyle.backgroundColor}
          {...props}
          ref={ref}
          hide={props.hide}
          zIndex={volumeStyle.zIndex}
        >
          <Box
            id='voice-control-volume'
            fontSize={fontSize}
            text={volume.toFixed(0).toString()}
            width={button.width}
            height={button.height}
            color={button.color}
            padding={button.padding}
            display="flex"
            justifyContent="center"
            alignItems="center"
          ></Box>
          <Box
            id='voice-control-box'
            height={boxHeight}
            width={button.width}
            // padding={button.padding}
            display="flex"
            position="relative"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            borderSize={button.padding}
            borderColor={button.color}
            onMouseDown={(e) => {
              setPreviewHide(false)
              const v =
                ((1 - e.offsetY / e.target.layoutNode.height) * volumeMax) | 0
              const newVolume = clamp(v, 0, volumeMax)
              dispatch.context.setVolume(newVolume)
              setPropertyNumber("volume", newVolume)
            }}
            onMouseEnter={() => {
              setPreviewHide(false)
            }}
            onMouseMove={(e) => {
              const { height } = e.target.layoutNode
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
              id='voice-control-box-inner'
              pointerEvents="none"
              height={volumeHeight * 100 + "%"}
              bottom={0}
              left={0}
              // width={button.width}
              width={button.width + button.padding * 2}
              // padding={button.padding}
              backgroundColor={button.color}
              position="absolute"
            ></Box>

            {previewHide || (
              <Box
                id='voice-control-cursor'
                pointerEvents="none"
                height={volumeStyle.previewCursorSize}
                left={0}
                bottom={previewBottom * 100 + "%"}
                width={button.width + button.padding * 2}
                // padding={button.padding}
                position="absolute"
                zIndex={volumeStyle.zIndex + 16}
                backgroundColor={
                  previewColor
                }
              />
            )}
          </Box>
          <Mute />
        </Box>
      )
    )
  }),
)
