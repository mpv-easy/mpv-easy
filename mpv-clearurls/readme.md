# @mpv-easy/clearurls

Automatically removes tracking parameters from video URLs when loading files in mpv. Inspired by [ClearURLs](https://github.com/ClearURLs/Addon/).

## Features
- **Auto-Clean**: Automatically strip tracking parameters from URLs when a file is loaded.
- **Modular Rules**: Each website has its own rule file, making it easy to add or update support.
- **Site-Specific Cleaning**: Only removes known tracking parameters while preserving essential ones (e.g., video ID, page number, timestamp).
- **Default Fallback**: If no site-specific rule matches, a default rule strips all query parameters.
- **Toggle Support**: Enable or disable the plugin at runtime via a script message.

## Supported Sites

| Site | Tracking Parameters Removed |
|------|---------------------------|
| **Bilibili** | `spm_id_from`, `vd_source`, `from_spmid`, `share_source`, `share_medium`, `share_plat`, `share_session_id`, `share_tag`, `unique_k`, `is_story_h5`, `bbid`, `ts`, `mid`, `csource`, `buvid`, `from_source`, `plat_id`, `share_from`, `msource`, `from`, `seid` |
| **YouTube** | `si`, `feature`, `pp`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid` |
| **Twitter/X** | `s`, `t`, `ref_src`, `ref_url` |
| **Default** | All query parameters (`?` and everything after it) |

## Installation
1. Visit the [mpv-easy online build tool](https://mpv-easy.github.io/mpv-build/).
2. Select **mpv-easy-clearurls** from the plugin list.
3. Click **Download portable_config.zip**.
4. Extract the downloaded ZIP file and move its contents to your mpv configuration directory (usually `portable_config` or `~/.config/mpv/`).

## Adding a New Site

1. Create a new rule file in `src/rules/` (e.g., `tiktok.ts`):

```typescript
import { Rule } from "../type"
import { removeQueryParams } from "../utils"

const TRACKING_PARAMS = [
  "param_to_remove_1",
  "param_to_remove_2",
]

export const Tiktok: Rule = {
  name: "TikTok",
  match: (url) => /^https?:\/\/(?:www\.)?tiktok\.com\//i.test(url),
  clean: (url) => removeQueryParams(url, TRACKING_PARAMS),
}
```

2. Export it from `src/rules/index.ts`:

```typescript
export * from "./tiktok"
```

3. Add it to the `Rules` array in `src/index.ts`:

```typescript
import { Bilibili, Youtube, Twitter, Tiktok, Default } from "./rules"

const Rules: Rule[] = [Bilibili, Youtube, Twitter, Tiktok]
```

## Project Structure

```
mpv-clearurls/src/
├── index.ts          # Plugin entry point — imports rules and wires up events
├── type.ts           # Rule interface definition
├── utils.ts          # Shared utilities (removeQueryParams, stripAllQueryParams)
└── rules/
    ├── index.ts      # Barrel export for all rules
    ├── bilibili.ts   # Bilibili-specific rule
    ├── youtube.ts    # YouTube-specific rule
    ├── twitter.ts    # Twitter/X-specific rule
    └── default.ts    # Fallback rule — strips all query params
```
