# maybe the simplest way to install mpv

## windows

- Select the directory where you want to install mpv. For example: `C:\tool`. Create this directory if it does not exist.
- Navigate to the selected directory in File Explorer, hold down the `Shift` key on your keyboard, while holding `Shift`, right-click inside the folder.
- From the context menu, click **"Open PowerShell window here"**.
- In the PowerShell window, input the following command and run:

```bash
powershell -ExecutionPolicy Bypass -c "irm https://github.com/mpv-easy/install/releases/latest/download/install.ps1 | iex"
```

<div style="display: flex;">
  <img src="https://github.com/mpv-easy/install/raw/main/assets/install.gif" alt="install"/>
</div>
