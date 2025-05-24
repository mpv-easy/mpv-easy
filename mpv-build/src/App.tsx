import React, { useEffect, useRef, useState } from "react"
import { Checkbox, Input } from "antd"
import type { CheckboxOptionType, GetProps } from "antd"
const { Search } = Input
type SearchProps = GetProps<typeof Input.Search>
import { Button, Flex, Spin, Table, type TableProps } from "antd"
import {
  DownloadOutlined,
  GithubOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from "@ant-design/icons"
import Fuse from "fuse.js"
import { Tag } from "antd"
import { Radio } from "antd"
import { decode, encode, File, Fmt, guess } from "@easy-install/easy-archive"
import { Typography } from "antd"
const { Title, Link } = Typography
import useSWR from "swr"

const META_URL =
  "https://raw.githubusercontent.com/mpv-easy/mpsm-scripts/main/meta.json"

function downloadBinaryFile(fileName: string, content: Uint8Array): void {
  const blob = new Blob([content], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const name = fileName.split("/").at(-1) ?? fileName
  a.download = name
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export type Meta = {
  name: string
  description: string
  author: string
  downloadURL: string
  url: string
  key: number
}

const MPV_UI = [
  {
    name: "mpv",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-windows.tar.xz",
  },
  {
    name: "mpv-uosc",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-uosc-windows-full.tar.xz",
  },
  {
    name: "mpv-easy",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-easy-windows-full.tar.xz",
  },
  {
    name: "mpv-modernx",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-modernx-windows-full.tar.xz",
  },
  {
    name: "mpv-modernz",
    url: "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-modernz-windows-full.tar.xz",
  },
]

const FFMPEG_URL =
  "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/ffmpeg-windows.zip"
const YT_DLP_URL =
  "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/yt-dlp.exe"
const PLAY_WITH_URL =
  "https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/mpv-easy-play-with-windows.exe"

async function downloadBinary(url: string): Promise<Uint8Array> {
  return fetch(url)
    .then((resp) => resp.arrayBuffer())
    .then((i) => new Uint8Array(i))
}

async function getScriptFiles(meta: Meta): Promise<File[]> {
  let name = meta.name
  const { downloadURL } = meta
  if (downloadURL.endsWith("master.zip") || downloadURL.endsWith("main.zip")) {
    name = `${meta.name}.zip`
  } else if (downloadURL.endsWith(".js") || downloadURL.endsWith(".lua")) {
    name = downloadURL.split("/").at(-1)!
  }
  if (![".js", ".lua", ".zip"].some((i) => downloadURL.endsWith(i))) {
    console.log("not support script: ", meta)
    return []
  }

  const url = `https://raw.githubusercontent.com/mpv-easy/mpv-easy-cdn/main/${name}`
  const bin = await downloadBinary(url)

  if (downloadURL.endsWith("master.zip") || downloadURL.endsWith("main.zip")) {
    const v = decode(guess(name)!, bin)!.filter((i) => !i.isDir)
    return v.map(
      ({ path, mode, isDir, buffer }) =>
        new File(`portable_config/scripts/${path}`, buffer, mode, isDir),
    )
  }
  if (name.endsWith(".js") || name.endsWith(".lua")) {
    return [new File(`portable_config/scripts/${name}`, bin, null, false)]
  }
  return []
}

function App() {
  const [data, setData] = useState<Meta[]>([])
  const [table, setTable] = useState<Meta[]>([])
  const [spinning, setSpinning] = useState(false)
  const fuseRef = useRef<Fuse<any> | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [external, setExternal] = useState<string[]>([])
  const [ui, setUI] = useState("mpv")

  const options: CheckboxOptionType<string>[] = [
    { label: "ffmpeg", value: "ffmpeg" },
    { label: "yt-dlp", value: "yt-dlp" },
    { label: "play-with", value: "play-with" },
  ]
  const zipAll = async () => {
    const uiUrl = MPV_UI.find((i) => i.name === ui)?.url
    if (!uiUrl) {
      return
    }
    // ui
    const uiBinary = await downloadBinary(uiUrl)
    const fmt = guess(uiUrl)
    if (!fmt) {
      console.log("fmt error")
      return
    }
    const uiFiles = decode(fmt, uiBinary)
    if (!uiFiles) {
      console.log("uiFiles error")
      return
    }
    const v: File[] = []
    for (const item of uiFiles) {
      try {
        const { path, mode, isDir, buffer } = item
        if (isDir) {
          continue
        }
        v.push(new File(path, new Uint8Array(buffer), mode, isDir))
      } catch (e) {
        console.log(e)
      }
    }

    // ffmpeg
    if (external.includes("ffmpeg")) {
      const ffmpegBinary = await downloadBinary(FFMPEG_URL)
      const ffmpegFiles = decode(guess(FFMPEG_URL)!, ffmpegBinary)!
      for (const { path, mode, isDir, buffer } of ffmpegFiles) {
        if (isDir) {
          continue
        }
        v.push(new File(path, buffer, mode, isDir))
      }
    }

    // yt-dlp
    if (external.includes("yt-dlp")) {
      const bin = await downloadBinary(YT_DLP_URL)
      v.push(new File("yt-dlp.exe", bin, null, false))
    }

    // play-with
    if (external.includes("play-with")) {
      const bin = await downloadBinary(PLAY_WITH_URL)
      v.push(new File("play-with.exe", bin, null, false))
    }

    // scripts
    for (const i of selected) {
      const files = await getScriptFiles(data[i])
      for (const i of files) {
        v.push(i)
      }
    }

    // encode to zip
    const zipBinary = encode(Fmt.Zip, v)
    if (!zipBinary) {
      console.log("zip file error")
      return
    }
    return zipBinary
  }
  const download = async () => {
    setSpinning(true)
    const zipBinary = await zipAll()
    setSpinning(false)
    if (zipBinary) {
      downloadBinaryFile(`${ui}.zip`, zipBinary)
    }
  }

  useEffect(() => {
    fetch(META_URL)
      .then((i) => i.text())
      .then((text) => {
        const data: Meta[] = Object.values(JSON.parse(text))
        for (let i = 0; i < data.length; i++) {
          data[i].key = i
        }
        setData(data)
        setTable([...data].sort(() => 0.5 - Math.random()))
        fuseRef.current = new Fuse(data, {
          keys: ["name"],
        })
      })
  }, [])

  const columns: TableProps<Meta>["columns"] = [
    {
      title: "name",
      dataIndex: "name",
      key: "key",
      render: (_, i) => {
        return (
          <Link href={i.url} target="_blank" rel="noreferrer">
            {i.name}
          </Link>
        )
      },
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
  ]

  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    console.log(info?.source, value)

    const v = fuseRef.current?.search(value)
    if (v?.length) {
      setTable(v.map((i) => i.item))
    }
  }

  if (!data.length) {
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
  return (
    <>
      <Flex
        className="main"
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
        </Flex>

        <Flex gap="middle" vertical justify="center" align="center">
          <Typography>
            <Title level={3}>UI</Title>
          </Typography>
          <Radio.Group
            onChange={(e) => {
              setUI(e.target.value)
            }}
            value={ui}
            options={MPV_UI.map((i) => ({
              value: i.name,
              label: i.name,
            }))}
          />
        </Flex>

        <Flex gap="middle" vertical justify="center" align="center">
          <Typography>
            <Title level={3}>External</Title>
          </Typography>
          <Checkbox.Group
            value={external}
            options={options}
            onChange={(e) => {
              setExternal(e)
            }}
          />
        </Flex>

        <Search
          placeholder="input search text"
          onSearch={onSearch}
          enterButton
        />
        <Table<Meta>
          rowSelection={{
            type: "checkbox",
            onChange: (selectedRowKeys: React.Key[], selectedRows: Meta[]) => {
              console.log(
                selectedRowKeys,
                `selectedRowKeys: ${selectedRowKeys}`,
                "selectedRows: ",
                selectedRows,
              )
              setSelected([...selected, +selectedRowKeys])
              setSelected(selectedRowKeys as number[])
            },
          }}
          className="table"
          columns={columns}
          dataSource={table}
        />
        <Spin spinning={spinning} fullscreen />
        <Flex>
          {selected.map((i) => {
            return (
              <Tag
                // TODO: support delete tag
                // closable
                color="success"
                key={data[i].key}
              >
                {data[i].name}
              </Tag>
            )
          })}
        </Flex>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size={"large"}
          onClick={download}
        >
          Download {ui}.zip
        </Button>
      </Flex>
    </>
  )
}

export default App
