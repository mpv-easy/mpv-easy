import React, { useEffect, useRef, useState } from "react"
import { Alert, Checkbox, Input, Tooltip } from "antd"
import type { GetProps } from "antd"
import { Button, Flex, Spin, Table, type TableProps } from "antd"
import {
  DownloadOutlined,
  GithubOutlined,
  MoonOutlined,
  SunOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from "@ant-design/icons"
import Fuse from "fuse.js"
import { Tag } from "antd"
import { Radio } from "antd"
import { decode, encode, File, Fmt, guess } from "@easy-install/easy-archive"
import { Typography } from "antd"
import {
  IncludesMap,
  checkConflict,
  installScript,
  tryFix,
} from "@mpv-easy/mpsm"
import { notification } from "antd"
import { useMount } from "react-use"
import { create } from "zustand"
import { persist, StateStorage, createJSONStorage } from "zustand/middleware"
import { ConfigProvider, theme } from "antd"
import { parseGitHubUrl, Repo } from "@mpv-easy/tool"
import "@ant-design/v5-patch-for-react-19"
import { download as downloadRepo } from "jdl"
import {
  DataType,
  DEFAULT_STATE,
  downloadBinary,
  downloadBinaryFile,
  ExternalList,
  getCdnFileUrl,
  getFfmpegUrl,
  getFfmpegV3Url,
  getMpvFiles,
  getPlayWithUrl,
  getScriptDownloadURL,
  getScriptFiles,
  getYtdlpUrl,
  Platform,
  PLATFORM_LIST,
  State,
  Store,
  UI,
  UI_LIST,
} from "./tool"

const { defaultAlgorithm, darkAlgorithm } = theme
const { Search } = Input
type SearchProps = GetProps<typeof Input.Search>
const { Title, Link } = Typography

const hashStorage: StateStorage = {
  getItem: (key): string => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    const storedValue = searchParams.get(key) ?? ""
    return JSON.parse(storedValue)
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.set(key, JSON.stringify(newValue))
    location.hash = searchParams.toString()
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.delete(key)
    location.hash = searchParams.toString()
  },
}

// const MAX_SCRIPT_COUNT = 32
const TITLE_WIDTH = 150
const ITEM_WIDTH = 150
const NAME_WIDTH = 250

const useMpvStore = create<Store>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      setData: (data: Record<string, DataType>) => set({ ...get(), data }),
      setTableData: (tableData: DataType[]) => set({ ...get(), tableData }),
      setSpinning: (spinning: boolean) => set({ ...get(), spinning }),
      setSelectedKeys: (selectedRowKeys: string[]) =>
        set({ ...get(), selectedRowKeys }),
      setExternalList: (externalList: string[]) =>
        set({ ...get(), externalList }),
      setUI: (ui: UI) => set({ ...get(), ui }),
      setPlatform: (platform: Platform) => set({ ...get(), platform }),
      setState: (state: State) => {
        set({ ...get(), ...state })
      },
      setRepos: (repos: Repo[]) => set({ ...get(), repos }),
    }),
    {
      name: "mpv-build",
      storage: createJSONStorage(() => hashStorage),
      version: undefined,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["data", "tableData", "spinning"].includes(key),
          ),
        ),
    },
  ),
)

function App() {
  const store = useMpvStore()
  const fuseRef = useRef<Fuse<any> | null>(null)
  const {
    data,
    tableData,
    spinning,
    selectedRowKeys,
    externalList,
    ui,
    setData,
    setTableData,
    setSpinning,
    setUI,
    setSelectedKeys,
    setExternalList,
    platform,
    setPlatform,
    setState,
    repos,
    setRepos,
  } = store
  const downloadName = ui === "mpv-easy" ? "mpv-easy" : `mpv-${ui}`
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  )

  const uiRequires: readonly string[] =
    UI_LIST.find((i) => i.name === ui)?.requires || []

  const [_, contextHolder] = notification.useNotification()

  const reset = () => {
    setState({ ...DEFAULT_STATE, data, tableData })
  }

  const allDeps = [
    ...selectedRowKeys,
    ...(UI_LIST.find((i) => i.name === ui)?.requires || []),
  ]

  const installDeps = async (files: File[]) => {
    // scripts
    // deps and requires
    for (const i of allDeps) {
      const script = data[i]
      const fixFiles = tryFix(files, script)
      if (script.repo) {
        const { user, repo } = script.repo
        const repoFiles = await downloadRepo(user, repo)
        const v = repoFiles
          .filter((i) => !i.isDir)
          .map(
            ({ path, buffer }) =>
              new File(path, buffer!, undefined, false, null),
          )
        const key = `${user}-${repo}`
        installScript(fixFiles, v, data[key])
      } else {
        const scriptFiles = await getScriptFiles(data[i])
        installScript(fixFiles, scriptFiles, data[i])
      }
    }
  }

  const zipPortableConfig = async () => {
    const files: File[] = []

    await installDeps(files)

    for (const i of files) {
      i.path = i.path.replace("portable_config/", "")
    }

    // encode to zip
    const zipBinary = encode(Fmt.Zip, files)
    if (!zipBinary) {
      console.log("zip file error")
      return
    }
    return zipBinary
  }

  const zipAll = async () => {
    const mpvFiles = await getMpvFiles(platform)

    // ffmpeg
    if (externalList.includes("ffmpeg")) {
      const url = platform === "mpv-v3" ? getFfmpegV3Url() : getFfmpegUrl()
      const ffmpegBinary = await downloadBinary(url)
      const files = decode(guess(url)!, ffmpegBinary)!
      for (const i of files) {
        mpvFiles.push(i)
      }
    }

    // yt-dlp
    if (externalList.includes("yt-dlp")) {
      const url = getYtdlpUrl()
      const bin = await downloadBinary(url)
      const files = decode(guess(url)!, bin)!
      for (const i of files) {
        mpvFiles.push(i)
      }
    }

    // play-with
    if (externalList.includes("play-with")) {
      const url = getPlayWithUrl()
      const bin = await downloadBinary(url)
      const files = decode(guess(url)!, bin)!
      for (const i of files) {
        mpvFiles.push(i)
      }
    }

    await installDeps(mpvFiles)

    // encode to zip
    const zipBinary = encode(Fmt.Zip, mpvFiles)
    if (!zipBinary) {
      console.log("zip file error")
      return
    }
    return zipBinary
  }
  const download = async () => {
    setSpinning(true)
    // Wait for spinning
    await new Promise((r) => setTimeout(r))
    const zipBinary = await zipAll()
    setSpinning(false)
    if (zipBinary) {
      downloadBinaryFile(`${downloadName}.zip`, zipBinary)
    }
  }

  const downloadPortableConfig = async () => {
    setSpinning(true)
    // Wait for spinning
    await new Promise((r) => setTimeout(r))
    const zipBinary = await zipPortableConfig()
    setSpinning(false)
    if (zipBinary) {
      downloadBinaryFile("portable_config.zip", zipBinary)
    }
  }

  const resetData = async () => {
    const META_URL = getCdnFileUrl("scripts-full.json")

    const data: Record<string, DataType> = await fetch(META_URL)
      .then((i) => i.text())
      .then((text) => JSON.parse(text))

    for (const i in data) {
      data[i].key = i
    }

    // repos
    for (const { user, repo } of repos) {
      const key = `${user}-${repo}`
      const homepage = `https://github.com/${user}/${repo}`
      const info: DataType = {
        key,
        name: key,
        download: key,
        author: user,
        description: homepage,
        homepage,
        repo: { user, repo },
      }
      data[key] = info
    }

    setData(data)

    const selectedData = selectedRowKeys.map((i) => data[i])
    const tableData = Object.values(data)
      .sort(() => 0.5 - Math.random())
      .filter((i) => !selectedRowKeys.includes(i.name))

    setTableData([...selectedData, ...tableData])
    fuseRef.current = new Fuse(Object.values(data), {
      keys: ["name"],
    })
  }

  useMount(resetData)

  useEffect(() => {
    resetData()
  }, [repos])

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "name",
      dataIndex: "name",
      key: "key",
      render: (_, i) => {
        return (
          <Link href={i.homepage} target="_blank" rel="noreferrer">
            {i.name}
          </Link>
        )
      },
      width: NAME_WIDTH,
    },
    {
      title: "description",
      dataIndex: "description",
      key: "key",
    },
    {
      title: "author",
      dataIndex: "author",
      key: "url",
    },
    {
      title: "download",
      dataIndex: "download",
      key: "url",
      render: (_, script) => {
        return (
          <Button
            key={script.download}
            icon={<DownloadOutlined />}
            onClick={async () => {
              if (script.repo) {
                const files = await downloadRepo(
                  script.repo.user,
                  script.repo.repo,
                )
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

              const bin = await downloadBinary(
                getScriptDownloadURL(script.name),
              )
              downloadBinaryFile(`${script.name}.zip`, bin)
            }}
          />
        )
      },
    },
  ]

  const onSearch: SearchProps["onSearch"] = (value, _e, _info) => {
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
  }

  if (!Object.keys(data).length) {
    return (
      <Flex
        className="main"
        vertical
        gap="middle"
        justify="center"
        align="center"
      >
        <Typography>
          <Title level={3}>Loading...</Title>
        </Typography>
      </Flex>
    )
  }

  const conflicts = checkConflict([
    ...selectedRowKeys,
    ...(UI_LIST.find((i) => i.name === ui)?.requires || []),
  ])
  const includes = IncludesMap[ui] || []

  return (
    <ConfigProvider
      theme={{ algorithm: isDark ? darkAlgorithm : defaultAlgorithm }}
    >
      {contextHolder}
      <Flex
        className={["main", isDark ? "main-dark" : "main-light"].join(" ")}
        vertical
        gap="middle"
        justify="center"
        align="center"
      >
        <Flex
          gap="middle"
          justify="center"
          align="center"
          style={{ position: "absolute", top: "1rem", right: "1rem" }}
        >
          <Typography.Link
            href="https://github.com/mpv-easy/mpv-easy"
            target="_blank"
          >
            <GithubOutlined />
          </Typography.Link>
          <Typography.Link
            href="https://www.youtube.com/@mpveasy"
            target="_blank"
          >
            <YoutubeOutlined />
          </Typography.Link>
          <Typography.Link href="https://x.com/mpv_easy" target="_blank">
            <TwitterOutlined />
          </Typography.Link>
          {isDark ? (
            <Typography.Link onClick={() => setIsDark(false)}>
              <SunOutlined />
            </Typography.Link>
          ) : (
            <Typography.Link onClick={() => setIsDark(true)}>
              <MoonOutlined />
            </Typography.Link>
          )}
        </Flex>

        <Flex gap="middle" vertical align="start">
          <Flex gap="middle" justify="center" align="center">
            <Typography.Title
              level={5}
              style={{ margin: 0, width: TITLE_WIDTH }}
            >
              <Tooltip title="mpv-v3 is for newer CPUs (usually after 2005). If it doesn't run, please use mpv">
                Platform:
              </Tooltip>
            </Typography.Title>
            <Radio.Group
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value)
              }}
            >
              {PLATFORM_LIST.map((i) => (
                <Tooltip
                  key={i}
                  placement="topLeft"
                  title={
                    i === "mpv"
                      ? `Typically, you should use mpv-v3 unless it fails to run or you're using an older CPU (manufactured around 2015 or earlier).`
                      : ""
                  }
                >
                  <Radio value={i} key={i} style={{ width: ITEM_WIDTH }}>
                    {i}
                  </Radio>
                </Tooltip>
              ))}
            </Radio.Group>
          </Flex>

          <Flex gap="middle" justify="center" align="center">
            <Typography.Title
              level={5}
              style={{ margin: 0, width: TITLE_WIDTH }}
            >
              UI:
            </Typography.Title>
            <Radio.Group
              onChange={(e) => {
                setUI(e.target.value)
                const deps =
                  UI_LIST.find((i) => i.name === e.target.value)?.deps || []
                setSelectedKeys([...deps])
              }}
              value={ui}
            >
              {UI_LIST.map((i) => (
                <Radio
                  value={i.name}
                  key={i.name}
                  style={{ width: ITEM_WIDTH }}
                >
                  <Typography.Link href={i.repo} target="_blank">
                    {i.name}
                  </Typography.Link>
                </Radio>
              ))}
            </Radio.Group>
          </Flex>

          <Flex gap="middle" justify="center" align="center">
            <Typography.Title
              level={5}
              style={{ margin: 0, width: TITLE_WIDTH }}
            >
              External:
            </Typography.Title>
            <Checkbox.Group
              value={externalList}
              onChange={(e) => {
                setExternalList(e)
              }}
            >
              {ExternalList.map((i) => (
                <Checkbox value={i} key={i} style={{ width: ITEM_WIDTH }}>
                  {i}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Flex>
        </Flex>

        <Search
          placeholder="input script name or https://github.com/<user>/<repo>"
          onSearch={onSearch}
          enterButton
        />
        <Table<DataType>
          rowSelection={{
            hideSelectAll: true,
            type: "checkbox",
            onSelect: (record, selected) => {
              if (selected) {
                setSelectedKeys([...selectedRowKeys, record.name])
              } else {
                setSelectedKeys(
                  [...selectedRowKeys].filter((i) => i !== record.name),
                )
              }
            },
            getCheckboxProps: (record: DataType) => {
              return {
                disabled:
                  uiRequires.includes(record.name) ||
                  includes.includes(record.name),
                name: record.name,
              }
            },
            selectedRowKeys: [...selectedRowKeys, ...uiRequires],
          }}
          className="table"
          columns={columns}
          dataSource={tableData}
        />
        <Spin spinning={spinning} fullscreen />
        <Flex>
          <Tag color="processing" key={platform}>
            {platform}
          </Tag>
          {uiRequires.map((i, index) => {
            return (
              data[i] && (
                <Tag color="success" key={data[i]?.key + index}>
                  {data[i]?.name}
                </Tag>
              )
            )
          })}
          {externalList.map((i) => {
            return (
              <Tag color="success" key={i}>
                {i}
              </Tag>
            )
          })}
          {selectedRowKeys.map((i, index) => {
            return (
              <Tag
                closable
                color="success"
                key={data[i]?.key + index}
                onClose={(e) => {
                  const index = selectedRowKeys.indexOf(data[i]?.key)
                  if (index !== -1) {
                    const v = [...selectedRowKeys]
                    v.splice(index, 1)
                    setSelectedKeys(v)
                  }
                  e.preventDefault()
                }}
              >
                {data[i]?.name}
              </Tag>
            )
          })}
        </Flex>
        <Flex gap="middle">
          <Button color="danger" size={"large"} variant="solid" onClick={reset}>
            Reset
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size={"large"}
            onClick={download}
          >
            {downloadName}.zip
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size={"large"}
            onClick={downloadPortableConfig}
          >
            portable_config.zip
          </Button>
        </Flex>
        {!!conflicts.length && (
          <Alert
            description={`conflict: ${conflicts.join(" ")}`}
            type="error"
          />
        )}
      </Flex>
    </ConfigProvider>
  )
}

export default App
