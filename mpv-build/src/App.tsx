import { useEffect, useRef, useState } from "react"
import { Input } from "antd"
import type { GetProps } from "antd"
const { Search } = Input
type SearchProps = GetProps<typeof Input.Search>
import { Button, Flex, Spin, Table, type TableProps } from "antd"
import { DownloadOutlined } from "@ant-design/icons"
import Fuse from "fuse.js"
import { Tag } from "antd"
import { Radio } from "antd"
import { decode, encode, File, Fmt, guess } from "@easy-install/easy-archive"
// @ts-ignore
import META from "../meta.json?raw"

function downloadBinaryFile(fileName: string, content: ArrayBuffer): void {
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

async function downloadBinary(url: string): Promise<Uint8Array> {
  return fetch(url)
    .then((resp) => resp.arrayBuffer())
    .then((i) => new Uint8Array(i))
}

async function getScriptFiles(meta: Meta): Promise<File[]> {
  console.log("getScriptFiles", meta)
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

  console.log("download script: ", meta, name, url)

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

  const zipAll = async () => {
    const uiUrl = MPV_UI.find((i) => i.name === ui)?.url
    if (!uiUrl) {
      return
    }
    // ui
    const uiBinary = await downloadBinary(uiUrl)
    const fmt = guess(uiUrl)
    console.log("fmt", fmt)
    if (!fmt) {
      console.log("fmt error")
      return
    }
    const uiFiles = decode(fmt, uiBinary)
    console.log("uiFiles", uiFiles)
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

    // ffmpeg and ytdlp
    // const ffmpegBinary = await downloadBinary(FFMPEG_URL);
    // const ytdlpBinary = await downloadBinary(YT_DLP_URL);

    // const ffmpegFiles = decode(guess(FFMPEG_URL)!, ffmpegBinary)!

    // for (const { path, mode, isDir, buffer } of ffmpegFiles) {
    //   if (isDir) {
    //     continue
    //   }
    //   v.push(new File(path, buffer, mode, isDir));
    // }
    // v.push(new File("yt-dlp.exe", ytdlpBinary, null, false));

    // scripts
    console.log("selected", selected)
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
    console.log("download", ui, selected)
    setSpinning(true)
    const zipBinary = await zipAll()
    setSpinning(false)
    if (zipBinary) {
      downloadBinaryFile(`${ui}.zip`, zipBinary)
    }
  }

  useEffect(() => {
    const data: Meta[] = Object.values(JSON.parse(META))
    for (let i = 0; i < data.length; i++) {
      data[i].key = i
    }
    setData(data)
    setTable([...data].sort(() => 0.5 - Math.random()))
    fuseRef.current = new Fuse(data, {
      keys: ["name"],
    })
  }, [])

  const columns: TableProps<Meta>["columns"] = [
    {
      title: "name",
      dataIndex: "name",
      key: "key",
      render: (_, i) => {
        return (
          <a href={i.url} target="_blank" rel="noreferrer">
            {i.name}
          </a>
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
      console.log(v)
      setTable(v.map((i) => i.item))
    }
  }
  const [ui, setUI] = useState("mpv")
  return (
    <>
      <Flex
        className="main"
        vertical
        gap="middle"
        justify="center"
        align="center"
      >
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
                onClose={(e) => {
                  console.log(e)
                  // const i = selected.indexOf()
                  e.preventDefault()
                }}
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
