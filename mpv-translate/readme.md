https://github.com/user-attachments/assets/b734f9e7-d847-43ab-9705-85dea9791d43


## install
You need to install [ffmpeg](https://www.ffmpeg.org/download.html) and curl and add them to ```PATH```, curl is usually installed by default on all systems including windows11, if you only use interactive translation, you don't need to install ffmpeg

- Download the latest version of [translate.js](https://github.com/mpv-easy/mpv-easy/releases) and copy it to the mpv script directory
- Add shortcut keys  ```ctrl+t    script-message cycle-translate-mode```, ```ctrl+i    script-message toggle-interactive-translate``` and ```Alt+t      script-message toggle-auto-translate``` to your ```input.conf```
- If everything goes well, you can use ```ctrl+t``` to cycle translation modes (None -> Translate -> Dual -> None), ```ctrl+i``` to toggle interactive translation, and ```Alt+t``` to toggle auto-translate.
- You can customize the styles of subtitles and tooltips, see [translate.conf](../mpv-easy-react/conf/translate.conf)

## support language

https://cloud.google.com/translate/docs/languages


## config

```json
{
  "sourceLang": "en-US",
  "targetLang": "zh-CN",
  "subOutputPath": ""
}
```

### Subtitle Output Path

The `subOutputPath` option controls where translated subtitles are saved using a template system.

- Empty (default): Saves to temp directory using `$TMP/$NAME.$LANG.srt`
- Custom template: Use variables to define a custom path

#### Template Variables

You can use the following variables in your custom template:

| Variable       | Description                                            |
| -------------- | ------------------------------------------------------ |
| `$HOME`        | Home/temp directory                                    |
| `$NAME`        | Video filename without extension                       |
| `$LANG`        | Target language code (e.g., zh-CN, en-US, zh-CN.en-US) |
| `$SOURCE_LANG` | Source language code (e.g., en-US)                     |
| `$TARGET_LANG` | Target language code (e.g., zh-CN)                     |
| `$TMP`         | Temporary directory                                    |
| `$FOLDER`      | Video file directory                                   |
| `$MPV`         | MPV installation directory                             |
| `$MPV_CONFIG`  | MPV config directory                                   |
| `$DESKTOP`     | Desktop directory                                      |

#### Examples

```conf
# Save to video folder
output_template=$FOLDER/$NAME.$LANG.srt

# Save to subfolder named after video
output_template=$FOLDER/$NAME/$NAME.$LANG.srt

# Save to temp directory
output_template=$TMP/$NAME.srt

# Save to custom subtitles folder
output_template=$HOME/subtitles/$NAME.$LANG.srt

# Save to desktop
output_template=$DESKTOP/$NAME.$LANG.srt

# Use source and target language codes
output_template=$FOLDER/$NAME.$SOURCE_LANG-$TARGET_LANG.srt
```

#### Template Examples

```conf
# Save to video folder with language suffix
sub-output-path=$FOLDER/$NAME.$LANG.srt

# Save to subfolder named after video
sub-output-path=$FOLDER/$NAME/$NAME.$LANG.srt

# Save to temp directory (same as default)
sub-output-path=$TMP/$NAME.srt

# Save to custom subtitles folder
sub-output-path=$HOME/subtitles/$NAME.$LANG.srt
```

Note: If the source and destination paths are the same, the copy operation will be skipped automatically.

## short key
[input.conf](../mpv-easy-react/conf/translate.input.conf)

| key    | command                                     |
| ------ | ------------------------------------------- |
| ctrl+t | script-message cycle-translate-mode         |
| ctrl+i | script-message toggle-interactive-translate |
| Alt+t  | script-message toggle-auto-translate        |

`input.conf`

```
CTRL+t     script-message cycle-translate-mode
CTRL+i     script-message toggle-interactive-translate
Alt+t      script-message toggle-auto-translate
```

## translate (Cycle Mode)

Press `CTRL+t` to cycle through modes: **None** -> **Translate** -> **Dual**.

### 1. Translate Mode
Displays only the translated subtitle.

<div style="display: flex;">
  <img src="../assets/img/translate-en-cn.png" alt="Chinese subtitle"/>
</div>

### 2. Dual Mode
Displays both original and translated subtitles.

<div style="display: flex;">
  <img src="../assets/img/translate-en-cn-dual.png" alt="dual-translate"/>
</div>

## interactive-translate (CTRL+i)

Press `CTRL+i` to toggle **Interactive Mode** globally.
- **On**: Translation is shown as an interactive overlay. You can click words to hear pronunciation or see details.
- **Off**: Translation is shown as standard subtitles (ass).

<div style="display: flex;">
  <img src="../assets/img/translate-en-interactive.png" alt="interactive-translate"/>
</div>

## auto-translate (Alt+t)

Press `Alt+t` to toggle **Auto-Translate**.
When enabled, the current translation mode will be automatically applied when a new video is loaded.


## todo
- auto detect source language
- remove ffmpeg dependency
- support more languages
- support ass
- support bing, deepl
