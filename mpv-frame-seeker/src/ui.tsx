import React, {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  forwardRef,
  RefAttributes,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { Box, useProperty } from "@mpv-easy/react"
import { AssDraw, C } from "@mpv-easy/assdraw"
import {
  frameStep,
  getAssScale,
  PropertyNumber,
  setPropertyBool,
} from "@mpv-easy/tool"

export function getOffset(
  width: number,
  start: number,
  current: number,
): number {
  if (width <= 0) return 0

  if (current <= start) {
    if (start <= 0) return -1

    const ratio = (current - start) / start // [-1, 0]
    return ratio
  }

  const rightWidth = width - start
  if (rightWidth <= 0) return 1

  const ratio = (current - start) / rightWidth // [0, 1]
  return ratio
}

export type FrameSeekerProps = {
  bottom: number
  color: string
  activeColor: string
  radius: number
  zIndex: number
  borderSize: number
  text: boolean
  frames: number
  fontSize: number
}

type DrawConfig = {
  left: number
  top: number
  radius: number
  borderSize: number
  degree: number
  color: string
  scale: number
}

function drawPointer({
  left = 0,
  top = 0,
  radius = 0,
  color = "FFFFFF",
  borderSize = 2,
  degree = 0,
  scale = getAssScale(),
}: Partial<DrawConfig>) {
  const pointerAss = new AssDraw()
    .an(7)
    .pos(left * scale, top * scale)
    .frz(degree)
    .borderSize(0)
    .color(color)
    .drawStart()
    .moveTo(0, 0)
    .lineTo(radius * scale, 0)
    .lineTo(radius * scale, borderSize * scale)
    .lineTo(0, borderSize * scale)
    .drawStop()
    .toString()
  return pointerAss
}

function drawCircle({
  left = 0,
  top = 0,
  radius = 0,
  borderSize = 2,
  color = "FFFFFF",
  scale = getAssScale(),
}: Partial<DrawConfig>) {
  const ctrl = radius * C * scale
  const circleAss = new AssDraw()
    .pos(left * scale, top * scale)
    .drawStart()
    .borderColor(color)
    .borderSize(borderSize * scale)
    .append("{\\1a&HFF&}")
    .moveTo(radius * scale, 0)
    .bezierCurve(
      radius * scale,
      -ctrl,
      ctrl,
      -radius * scale,
      0,
      -radius * scale,
    )
    .bezierCurve(
      -ctrl,
      -radius * scale,
      -radius * scale,
      -ctrl,
      -radius * scale,
      0,
    )
    .lineTo(radius * scale, 0)
    .end()
    .toString()
  return circleAss
}

export type FrameSeekerRef = {
  click: (x: number) => void
}

const frameProp = new PropertyNumber("estimated-frame-number")
export const FrameSeeker: ForwardRefExoticComponent<
  PropsWithoutRef<FrameSeekerProps> & RefAttributes<FrameSeekerRef>
> = forwardRef<FrameSeekerRef, FrameSeekerProps>((props, ref) => {
  const { radius, zIndex, text, frames, borderSize, fontSize } = props
  const osd = useProperty("osd-dimensions")[0]
  const mouseX = useProperty("mouse-pos")[0].x
  const clickX = useRef(0)
  const offset = getOffset(osd.w, clickX.current, mouseX)
  const left = (osd.w - props.radius) / 2
  const top = osd.h - props.bottom
  const [active, setActive] = useState(false)
  const _fpsRef = useRef(0)
  const [base, setBase] = useState(0)
  const color = active ? props.activeColor : props.color
  useImperativeHandle(ref, () => {
    return {
      click(x: number) {
        clickX.current = x
        setPropertyBool("pause", true)
        setActive((v) => !v)
        setBase(frameProp.value)
      },
    }
  }, [])

  const degree = 360 - (offset * 90 + 270)
  const scale = getAssScale()
  const circleAss = drawCircle({
    left,
    top,
    radius,
    color,
    borderSize,
    scale,
  })
  const pointerAss = drawPointer({
    left,
    top,
    radius,
    degree,
    color,
    borderSize,
    scale,
  })
  const offsetFrame = (offset * (frames / 2)) | 0
  if (active) {
    const target = (base + (offset * frames) / 2) | 0
    const currentFrame = frameProp.value
    if (target !== currentFrame) {
      frameStep(target - currentFrame, "seek")
    }
  }
  const frameText = `${base}${offsetFrame > 0 ? `+${offsetFrame}` : offsetFrame}`
  return (
    <Box
      width={radius * 2}
      height={radius}
      position="absolute"
      top={top - radius}
      left={left - radius}
      zIndex={zIndex}
    >
      <Box
        draw={circleAss}
        position="absolute"
        top={top - radius}
        left={left - radius}
        width={radius * 2}
        height={radius}
      ></Box>
      <Box
        draw={pointerAss}
        position="absolute"
        top={top - radius}
        left={left - radius}
        width={radius * 2}
        height={radius}
      ></Box>
      {text && frameText.length && (
        <Box
          position="absolute"
          display="flex"
          top={top}
          left={left - radius}
          width={radius * 2}
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          text={frameText}
          color={color}
          fontSize={fontSize}
        />
      )}
    </Box>
  )
})
