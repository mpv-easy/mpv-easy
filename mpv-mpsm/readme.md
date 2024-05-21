mpsm(mpv script manager)

```bash
npm i @mpv-easy/mpsm -g

# set mpv script dir first!
mpsm set-script-dir '<your-mpv-dir>/portable_config/scripts'

# print mpv script dir
mpsm get-script-dir


# install script from @mpv-easy/mpsm github repo
mpsm install speed
mpsm uninstall speed

# install script from url
mpsm install "<your-script-url>"

# list installed scripts
mpsm list

# update a installed script
mpsm update speed

# update all installed scripts
mpsm update --all
```
