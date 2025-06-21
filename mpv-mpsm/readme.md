## mpsm(mpv script manager)

### MPV Script RFC

https://github.com/mpv-easy/mpv-easy/blob/main/blog/Revolutionizing-mpv-Scripting-A-New-Package-Format-Proposal.md


### Usage

```bash
npm i @mpv-easy/mpsm -g

# set mpv config dir first!
mpsm set-config-dir '<your-mpv-dir>/portable_config'

# print mpv config dir
mpsm get-config-dir


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
