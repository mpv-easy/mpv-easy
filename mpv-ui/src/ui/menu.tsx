import React from "react"
import { Box } from "./box"

export interface MenuItem {
  title: string
  id: string | number
  children?: MenuItem[]
  action: (item: MenuItem) => void
}

export interface MenuProps {
  menuItem: MenuItem
}

export function Menu(props: MenuProps) {
  return <Box></Box>
}
