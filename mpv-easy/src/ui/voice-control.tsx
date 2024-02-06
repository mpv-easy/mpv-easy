import { setPropertyNumber } from "../../../mpv-tool/src/mpv"
import { BaseElementProps, Box, DOMElement } from "@mpv-easy/ui"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  volumeMaxSelector,
  volumeSelector,
  Dispatch,
  buttonStyleSelector,
  volumeStyleSelector,
  osdDimensionsSelector,
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
    const volumeHeight = (volume / volumeMax) * 100 + "%"

    const h = useSelector(osdDimensionsSelector).h

    const boxHeight = button.height * 5
    const wrapHeight = boxHeight + button.height * 2 + button.padding * 8
    const wrapTop = (h - wrapHeight) / 2
    return (
      h > wrapHeight && (
        <Box
          top={wrapTop}
          right={0}
          width={button.width + 6 * button.padding}
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
          // zIndex={volumeStyle.zIndex}
        >
          <Box
            text={volume.toFixed(0).toString()}
            width={button.width}
            height={button.height}
            color={button.color}
            padding={button.padding}
            fontSize={volumeStyle.fontSize}
            display="flex"
            justifyContent="center"
            alignItems="center"
          ></Box>
          <Box
            height={boxHeight}
            width={button.width}
            display="flex"
            position="relative"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            borderSize={button.padding}
            borderColor={button.color}
            onMouseDown={(e) => {
              const v =
                ((1 - e.offsetY / e.target.layoutNode.height) * volumeMax) | 0
              const newVolume = clamp(v, 0, volumeMax)
              dispatch.context.setVolume(newVolume)
              setPropertyNumber("volume", newVolume)
            }}
          >
            <Box
              pointerEvents="none"
              height={volumeHeight}
              bottom={0}
              left={0}
              width={button.width}
              padding={button.padding}
              backgroundColor={button.color}
            ></Box>
          </Box>
          <Mute />
        </Box>
      )
    )
  }),
)
