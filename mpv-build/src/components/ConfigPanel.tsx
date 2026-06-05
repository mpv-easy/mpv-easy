import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  ITEM_WIDTH,
  PLATFORM_LIST,
  TITLE_WIDTH,
  UI_LIST,
  ExternalList,
} from "../constants"
import type { Platform, UI } from "../types"

interface ConfigPanelProps {
  platform: Platform
  ui: UI
  externalList: string[]
  onPlatformChange: (platform: Platform) => void
  onUIChange: (ui: UI) => void
  onExternalListChange: (externalList: string[]) => void
}

/**
 * Configuration panel containing Platform, UI, and External tool selectors.
 */
export function ConfigPanel({
  platform,
  ui,
  externalList,
  onPlatformChange,
  onUIChange,
  onExternalListChange,
}: ConfigPanelProps) {
  return (
    <Stack
      sx={{
        gap: 1,
        alignItems: "flex-start",
      }}
    >
      {/* Platform selection */}
      <PlatformSelector platform={platform} onChange={onPlatformChange} />

      {/* UI selection */}
      <UISelector ui={ui} onChange={onUIChange} />

      {/* External tools selection */}
      <ExternalSelector
        externalList={externalList}
        onChange={onExternalListChange}
      />
    </Stack>
  )
}

// --- Sub-components ---

function PlatformSelector({
  platform,
  onChange,
}: {
  platform: Platform
  onChange: (p: Platform) => void
}) {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: 1,
        alignItems: "center",
      }}
    >
      <Tooltip title="mpv-v3 is for newer CPUs (usually after 2005). If it doesn't run, please use mpv">
        <Typography
          sx={{
            fontWeight: "bold",
            width: TITLE_WIDTH,
          }}
          variant="subtitle1"
        >
          Platform:
        </Typography>
      </Tooltip>
      <RadioGroup
        row
        value={platform}
        onChange={(e) => onChange(e.target.value as Platform)}
      >
        {PLATFORM_LIST.map((i) => (
          <Tooltip
            key={i}
            placement="top"
            title={
              i === "mpv"
                ? `Typically, you should use mpv-v3 unless it fails to run or you're using an older CPU (manufactured around 2015 or earlier).`
                : ""
            }
          >
            <FormControlLabel
              value={i}
              control={<Radio />}
              label={i}
              sx={{ width: ITEM_WIDTH }}
              checked={platform === i}
              onChange={(e) =>
                onChange((e.target as HTMLInputElement).value as Platform)
              }
            />
          </Tooltip>
        ))}
      </RadioGroup>
    </Stack>
  )
}

function UISelector({ ui, onChange }: { ui: UI; onChange: (ui: UI) => void }) {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: 1,
        alignItems: "center",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          width: TITLE_WIDTH,
          fontWeight: "bold",
        }}
      >
        UI:
      </Typography>
      <RadioGroup row value={ui}>
        {UI_LIST.map((i) => (
          <FormControlLabel
            key={i.name}
            value={i.name}
            control={<Radio />}
            label={
              <Link href={i.repo} target="_blank" underline="hover">
                {i.name}
              </Link>
            }
            sx={{ width: ITEM_WIDTH }}
            checked={ui === i.name}
            onChange={(e) => {
              onChange((e.target as HTMLInputElement).value as UI)
            }}
          />
        ))}
      </RadioGroup>
    </Stack>
  )
}

function ExternalSelector({
  externalList,
  onChange,
}: {
  externalList: string[]
  onChange: (list: string[]) => void
}) {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: 1,
        alignItems: "center",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          width: TITLE_WIDTH,
          fontWeight: "bold",
        }}
      >
        External:
      </Typography>
      <FormGroup row>
        {ExternalList.map((i) => (
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                checked={externalList.includes(i)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...externalList, i])
                  } else {
                    onChange(externalList.filter((x) => x !== i))
                  }
                }}
              />
            }
            label={i}
            sx={{ width: ITEM_WIDTH }}
          />
        ))}
      </FormGroup>
    </Stack>
  )
}
