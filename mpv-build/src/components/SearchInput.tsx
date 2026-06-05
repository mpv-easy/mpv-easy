import React, { useState } from "react"
import { IconButton, InputAdornment, TextField } from "@mui/material"
import { Search } from "@mui/icons-material"

interface SearchInputProps {
  onSearch: (value: string) => void
}

/**
 * Search bar with Enter key and click-to-search support.
 * Manages its own input value state.
 */
export function SearchInput({ onSearch }: SearchInputProps) {
  const [searchValue, setSearchValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch(searchValue)
    }
  }

  return (
    <TextField
      placeholder="input script name or https://github.com/<user>/<repo>"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onKeyDown={handleKeyDown}
      sx={{ width: "100%", maxWidth: 1000 }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => onSearch(searchValue)} edge="end">
                <Search />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
