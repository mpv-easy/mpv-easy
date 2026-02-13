https://github.com/user-attachments/assets/b734f9e7-d847-43ab-9705-85dea9791d43


## install
You need to install [ffmpeg](https://www.ffmpeg.org/download.html) and curl and add them to ```PATH```, curl is usually installed by default on all systems including windows11, if you only use interactive translation, you don't need to install ffmpeg

- Download the latest version of [translate.js](https://github.com/mpv-easy/mpv-easy/releases) and copy it to the mpv script directory
- Add shortcut keys  ```ctrl+t    script-message cycle-translate-mode```, ```ctrl+i    script-message toggle-interactive-translate``` and ```Alt+t      script-message toggle-auto-translate``` to your ```input.conf```
- If everything goes well, you can use ```ctrl+t``` to cycle translation modes (None -> Translate -> Mix -> None), ```ctrl+i``` to toggle interactive translation, and ```Alt+t``` to toggle auto-translate.
- You can customize the styles of subtitles and tooltips, see [translate.conf](./translate.conf)

## support language

https://cloud.google.com/translate/docs/languages


## config

```json
{
  "sourceLang": "en-US",
  "targetLang": "zh-CN",
}
```

## short key

| key    | command                                 |
| ------ | --------------------------------------- |
| ctrl+t | script-message cycle-translate-mode     |
| ctrl+i | script-message toggle-interactive-translate |
| Alt+t  | script-message toggle-auto-translate    |

`input.conf`

```
CTRL+t     script-message cycle-translate-mode
CTRL+i     script-message toggle-interactive-translate
Alt+t      script-message toggle-auto-translate
```

## translate (ctrl+t)

Default subtitle is English

<div style="display: flex;">
  <img src="../assets/img/translate-en.png" alt="English subtitle"/>
</div>

Translate to Chinese (Cycle mode to Translate)

<div style="display: flex;">
  <img src="../assets/img/translate-en-cn.png" alt="Chinese subtitle"/>
</div>

## mix-translate (Cycle mode to Mix)

Display Chinese and English

<div style="display: flex;">
  <img src="../assets/img/translate-en-cn-mix.png" alt="mix-translate"/>
</div>

## interactive-translate (ctrl+i)

Click left mouse button to play the audio, and click the wheel to display the full sentence translation. Toggles global interactive mode.
<div style="display: flex;">
  <img src="../assets/img/translate-en-interactive.png" alt="interactive-translate"/>
</div>

## mix-translate and interactive-translate

Mix translation and interactive translation can be used at the same time

<div style="display: flex;">
  <img src="../assets/img/translate-en-interactive-mix.png" alt="mix-translate and interactive-translate"/>
</div>


## todo
- auto detect source language
- remove ffmpeg dependency
- support more languages
- support ass
- support bing, deepl
