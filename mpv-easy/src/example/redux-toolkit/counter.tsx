import { EntityId } from "@reduxjs/toolkit"
import { memo } from "react"
import { counterActions, counterSelectors } from "./counter.slice"
import { useAppDispatch, useAppSelector } from "./store"
import { Box } from "@mpv-easy/ui"
import React from "react"

export interface CounterProps {
  counterId: string
}

const intervalMs = 1_000
const delayMs = 2_000

export const Counter = memo(function Counter({ counterId }: CounterProps) {
  const counter = useAppSelector((state) =>
    counterSelectors.selectById(state, counterId),
  )
  const appDispatch = useAppDispatch()

  if (!counter) {
    return null
  }

  const { id, value } = counter

  const add = () => appDispatch(counterActions.updateBy({ id, delta: +1 }))
  const subtract = () => appDispatch(counterActions.updateBy({ id, delta: -1 }))
  const close = () => appDispatch(counterActions.removeCounter(id))
  const updateAsync = () =>
    appDispatch(counterActions.updateByAsync({ id, delayMs, delta: 1 }))
  const intervalUpdate = () => {
    if (counter.intervalMs) {
      appDispatch(counterActions.cancelAsyncUpdates(id))
    } else {
      appDispatch(
        counterActions.updateByPeriodically({ id, delta: 1, intervalMs }),
      )
    }
  }

  return (
    <Box>
      <Box>ID: {id}</Box>
      <Box>{value}</Box>
      <Box onClick={add}>+</Box>
      <Box onClick={subtract}>-</Box>
    </Box>
  )
})
