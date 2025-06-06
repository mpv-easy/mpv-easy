mpsm(mpv script manager)

```bash
npm i @mpv-easy/mpsm -g

# set mpv script dir first!
mpsm set-script-dir '<your-mpv-dir>/portable_config/scripts'

# print mpv script dir
mpsm get-script-dir


# install script from https://github.com/mpv-easy/mpsm-scripts
mpsm install mpv-easy-crop
mpsm uninstall mpv-easy-crop

# install script from url
mpsm install "<your-script-url>"

# list installed scripts
mpsm list

# update a installed script
mpsm update speed

# update all installed scripts
mpsm update --all

# backup all installed scripts to json file
mpsm backup ./backup.json

# restore all scripts from json file
mpsm restore ./backup.json
```
