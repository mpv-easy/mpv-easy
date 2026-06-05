import { useEffect } from "react"
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Backdrop,
  CircularProgress,
  Alert,
} from "@mui/material"
import { useMpvStore } from "./store"
import { useAppTheme } from "./hooks/useTheme"
import { useAppActions, getConflicts, getIncludes } from "./logic"
import { DEFAULT_STATE, UI_LIST } from "./constants"
import type { UI } from "./types"
import { HeaderBar } from "./components/HeaderBar"
import { ConfigPanel } from "./components/ConfigPanel"
import { SearchInput } from "./components/SearchInput"
import { ScriptTable } from "./components/ScriptTable"
import { SelectedChips } from "./components/SelectedChips"
import { ActionButtons } from "./components/ActionButtons"
import { LoadingScreen } from "./components/LoadingScreen"

function App() {
  const store = useMpvStore()
  const { isDark, theme, toggleTheme } = useAppTheme()

  const {
    data,
    tableData,
    spinning,
    selectedRowKeys,
    externalList,
    ui,
    platform,
    repos,
    setSelectedKeys,
    setExternalList,
    setUI,
    setPlatform,
    setState,
  } = store

  const {
    downloadName,
    download,
    downloadPortableConfig,
    resetData,
    handleSearch,
    handleDownloadScript,
  } = useAppActions(store, (msg) => console.error(msg))

  useEffect(() => {
    resetData()
  }, [])

  useEffect(() => {
    resetData()
  }, [repos])

  const uiRequires: readonly string[] =
    UI_LIST.find((i) => i.name === ui)?.requires || []

  const handleRowSelect = (record: { name: string }, selected: boolean) => {
    if (selected) {
      setSelectedKeys([...selectedRowKeys, record.name])
    } else {
      setSelectedKeys(selectedRowKeys.filter((i) => i !== record.name))
    }
  }

  const handleUIChange = (newUI: UI) => {
    setUI(newUI)
    const deps = UI_LIST.find((i) => i.name === newUI)?.deps || []
    setSelectedKeys([...deps])
  }

  const handleDeleteSelected = (key: string) => {
    const idx = selectedRowKeys.indexOf(key)
    if (idx !== -1) {
      const v = [...selectedRowKeys]
      v.splice(idx, 1)
      setSelectedKeys(v)
    }
  }

  const reset = () => {
    setState({ ...DEFAULT_STATE, data, tableData })
  }

  if (!Object.keys(data).length) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingScreen />
      </ThemeProvider>
    )
  }

  const conflicts = getConflicts(selectedRowKeys, ui)
  const includes = getIncludes(ui)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        className={["main", isDark ? "main-dark" : "main-light"].join(" ")}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <HeaderBar isDark={isDark} onToggleTheme={toggleTheme} />

        <ConfigPanel
          platform={platform}
          ui={ui}
          externalList={externalList}
          onPlatformChange={setPlatform}
          onUIChange={handleUIChange}
          onExternalListChange={setExternalList}
        />

        <SearchInput onSearch={handleSearch} />

        <ScriptTable
          tableData={tableData}
          selectedRowKeys={selectedRowKeys}
          uiRequires={uiRequires}
          includes={includes}
          onRowSelect={handleRowSelect}
          onDownloadScript={handleDownloadScript}
        />

        <Backdrop open={spinning} sx={{ zIndex: 9999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <SelectedChips
          platform={platform}
          uiRequires={uiRequires}
          externalList={externalList}
          selectedRowKeys={selectedRowKeys}
          data={data}
          onDeleteSelected={handleDeleteSelected}
        />

        <ActionButtons
          downloadName={downloadName}
          onReset={reset}
          onDownload={download}
          onDownloadPortableConfig={downloadPortableConfig}
        />

        {!!conflicts.length && (
          <Alert severity="error">conflict: {conflicts.join(" ")}</Alert>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default App
