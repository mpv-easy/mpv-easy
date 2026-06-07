import { useCallback, useRef } from "react"
import type Fuse from "fuse.js"
import { encode, File, Fmt } from "@easy-install/easy-archive"
import {
  IncludesMap,
  checkConflict,
  installScript,
  tryFix,
} from "@mpv-easy/mpsm"
import { parseGitHubUrl } from "@mpv-easy/tool"
import { download as downloadRepo } from "jdl"
import type { DataType, Store, UI } from "./types"
import {
  getCdnFileUrl,
  getFfmpegUrl,
  getPlayWithUrl,
  getYtdlpUrl,
  UI_LIST,
} from "./constants"
import {
  downloadBinary,
  downloadBinaryFile,
  downloadExternal,
  getMpvFiles,
  getScriptFiles,
  getScriptDownloadURL,
} from "./download"
export function useAppActions(
  store: Store,
  setErrorMsg: (msg: string | null) => void,
) {
  const {
    data,
    selectedRowKeys,
    externalList,
    ui,
    platform,
    repos,
    setData,
    setTableData,
    setSpinning,
    setSelectedKeys,
    setRepos,
  } = store

  const fuseRef = useRef<Fuse<any> | null>(null)

  const allDeps = [
    ...selectedRowKeys,
    ...(UI_LIST.find((i) => i.name === ui)?.requires || []),
  ]

  const installDeps = useCallback(
    async (files: File[]) => {
      for (const i of allDeps) {
        const script = data[i]
        if (!script) continue
        if (script.repo) {
          const { user, repo } = script.repo
          const repoFiles = await downloadRepo(user, repo)
          const v = repoFiles
            .filter((i) => !i.isDir)
            .map(
              ({ path, buffer }) =>
                new File(path, buffer!, undefined, false, null),
            )
          const fixFiles = tryFix(v, script)
          const key = `${user}-${repo}`
          installScript(files, fixFiles, data[key])
        } else {
          const scriptFiles = await getScriptFiles(data[i])
          const fixFiles = tryFix(scriptFiles, script)
          installScript(files, fixFiles, data[i])
        }
      }
    },
    [allDeps, data],
  )

  const zipPortableConfig = useCallback(async () => {
    const files: File[] = []
    await installDeps(files)
    for (const i of files) {
      i.path = i.path.replace("portable_config/", "")
    }
    const zipBinary = encode(Fmt.Zip, files)
    if (!zipBinary) {
      console.error("zip file error")
      return
    }
    return zipBinary
  }, [installDeps])

  const zipAll = useCallback(async () => {
    const mpvFiles = await getMpvFiles(platform)

    if (externalList.includes("ffmpeg")) {
      const files = await downloadExternal(getFfmpegUrl())
      for (const i of files) mpvFiles.push(i)
    }
    if (externalList.includes("yt-dlp")) {
      const files = await downloadExternal(getYtdlpUrl())
      for (const i of files) mpvFiles.push(i)
    }
    if (externalList.includes("play-with")) {
      const files = await downloadExternal(getPlayWithUrl())
      for (const i of files) mpvFiles.push(i)
    }

    await installDeps(mpvFiles)

    const zipBinary = encode(Fmt.Zip, mpvFiles)
    if (!zipBinary) {
      console.error("zip file error")
      return
    }
    return zipBinary
  }, [platform, externalList, installDeps])

  const downloadName = ui === "mpv-easy" ? "mpv-easy" : `mpv-${ui}`

  const download = useCallback(async () => {
    setSpinning(true)
    try {
      await new Promise((r) => setTimeout(r))
      const zipBinary = await zipAll()
      if (zipBinary) {
        downloadBinaryFile(`${downloadName}.zip`, zipBinary)
      }
    } catch (e) {
      console.error("download error:", e)
      setErrorMsg(String(e))
    } finally {
      setSpinning(false)
    }
  }, [setSpinning, zipAll, downloadName, setErrorMsg])

  const downloadPortableConfig = useCallback(async () => {
    setSpinning(true)
    try {
      await new Promise((r) => setTimeout(r))
      const zipBinary = await zipPortableConfig()
      if (zipBinary) {
        downloadBinaryFile("portable_config.zip", zipBinary)
      }
    } catch (e) {
      console.error("downloadPortableConfig error:", e)
      setErrorMsg(String(e))
    } finally {
      setSpinning(false)
    }
  }, [setSpinning, zipPortableConfig, setErrorMsg])

  const resetData = useCallback(async () => {
    const META_URL = getCdnFileUrl("scripts-full.json")

    const fetched: Record<string, DataType> = await fetch(META_URL)
      .then((i) => i.text())
      .then((text) => JSON.parse(text))

    for (const i in fetched) {
      fetched[i].key = i
    }

    for (const { user, repo } of repos) {
      const key = `${user}-${repo}`
      const homepage = `https://github.com/${user}/${repo}`
      const info: DataType = {
        key,
        name: key,
        scriptName: repo,
        download: key,
        author: user,
        description: homepage,
        homepage,
        repo: { user, repo },
      }
      fetched[key] = info
    }

    setData(fetched)

    const selectedData = selectedRowKeys.map((i) => fetched[i])
    const newTableData = Object.values(fetched)
      .sort(() => 0.5 - Math.random())
      .filter((i) => !selectedRowKeys.includes(i.name))

    setTableData([...selectedData, ...newTableData])
    fuseRef.current = new (await import("fuse.js")).default(
      Object.values(fetched),
      { keys: ["name"] },
    )
  }, [repos, selectedRowKeys, setData, setTableData])

  const handleSearch = useCallback(
    (searchValue: string) => {
      const value = searchValue.trim()
      if (!value) return

      const gh = parseGitHubUrl(value)
      if (gh) {
        setSelectedKeys([
          ...new Set([...selectedRowKeys, `${gh.user}-${gh.repo}`]),
        ])
        setRepos([...new Set([...repos, gh])])
        return
      }

      const v = fuseRef.current?.search(value)
      if (v?.length) {
        setTableData(v.map((i) => i.item))
      }
    },
    [selectedRowKeys, repos, setSelectedKeys, setRepos, setTableData],
  )

  const handleDownloadScript = useCallback(
    async (script: DataType) => {
      try {
        if (script.repo) {
          const files = await downloadRepo(script.repo.user, script.repo.repo)
          const v = files
            .filter((i) => !i.isDir)
            .map(
              ({ path, buffer }) =>
                new File(path, buffer!, undefined, false, null),
            )
          const zipBinary = encode(Fmt.Zip, v)
          if (zipBinary) {
            downloadBinaryFile(`${script.repo.repo}.zip`, zipBinary)
          }
          return
        }

        const bin = await downloadBinary(getScriptDownloadURL(script.name))
        downloadBinaryFile(`${script.name}.zip`, bin)
      } catch (e) {
        console.error("handleDownloadScript error:", e)
        setErrorMsg(String(e))
      }
    },
    [setErrorMsg],
  )

  return {
    fuseRef,
    downloadName,
    allDeps,
    download,
    downloadPortableConfig,
    resetData,
    handleSearch,
    handleDownloadScript,
  }
}

export function getConflicts(selectedRowKeys: string[], ui: UI) {
  return checkConflict([
    ...selectedRowKeys,
    ...(UI_LIST.find((i) => i.name === ui)?.requires || []),
  ])
}

export function getIncludes(ui: UI): string[] {
  return IncludesMap[ui] || []
}
