# @mpv-easy/sponsorblock

Automates skipping of various segments (sponsors, intros, outros, self-promotion, etc.) in YouTube videos using [SponsorBlock](https://sponsor.ajay.app/).

## Features
- **Auto-Skip**: Automatically skip marked segments during YouTube video playback.
- **Customizable Categories**: Choose which categories to skip (e.g., sponsor, outro, self-promotion).
- **Multi-Server Support**: Configure multiple API servers for better reliability.
- **Data Caching**: Cache segment data locally to reduce repetitive requests.

## Installation
1. Visit the [mpv-easy online build tool](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22mpv-easy-sponsorblock%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22osc%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%5D%7D%7D%22).
2. Click **Download portable_config.zip**.
3. Extract the downloaded ZIP file and move its contents to your mpv configuration directory (usually `portable_config` or `~/.config/mpv/`).

## Configuration
You can customize the plugin's behavior by editing `sponsorblock.conf`:

```ini
# API server URLs, separated by commas
# Default: https://sponsor.ajay.app/api/skipSegments,https://api.sponsor.ajay.app/api/skipSegments
servers=https://sponsor.ajay.app/api/skipSegments,https://api.sponsor.ajay.app/api/skipSegments

# whether to enable the plugin at startup
active=yes

# Categories to skip, separated by commas
# Options: sponsor, intro, outro, selfpromo, interaction, music_offtopic, preview, filler
# Default: sponsor,outro,selfpromo
categories=sponsor,outro,selfpromo

# Script message event name, used for keybinding to toggle the plugin status
# Default: sponsorblock
sponsorblock-event-name=sponsorblock

# Cache expiration time (in seconds), default is 86400 (1 day), 0 means no limit
cache-ttl=86400
```

## Keybindings
By default, the plugin can be toggled using the following key (configurable in `input.conf`):

```
b     script-message sponsorblock
```
