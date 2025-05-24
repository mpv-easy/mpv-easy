# mpv-build: Customize your own MPV right from your browser

MPV is an incredible open-source media player, but let’s face it—for newcomers, setting it up can feel overwhelming. Picking the right download source, finding the perfect zip file, figuring out how to extract a 7z file, and then hunting down plugins via Google or online forums? It’s a lot. That’s why I created **mpv-build**, a website that lets you build a custom MPV player right in your browser. No privacy worries here either—it doesn’t collect any of your info (mostly because I can’t afford a server!). You pick your UI, add features like yt-dlp for remote video playback, search for scripts, and download a ready-to-go zip file. Unzip it, and you’re done!

---

## What is mpv-build?

mpv-build is all about making MPV accessible. It’s a browser-based tool that helps you craft a personalized MPV media player without the usual setup headaches. Here’s what you can do with it:

- **Choose your UI:** Pick from options like `mpv`, `mpv uosc`, `modernx`, `modernz`, or `mpv-easy`.
- **Add extra features:** Want to play remote videos? Add `yt-dlp`. Need advanced functionality? Throw in `ffmpeg`. Prefer browser integration? Select `play-with`.
- **Install scripts:** Search for scripts by keyword and enhance MPV with the features you need.
- **Download and go:** Get a zip file with everything pre-configured—just extract and start using your custom MPV.

---

## How to use mpv-build

Getting started is a breeze. Here’s the step-by-step:

1. **Pick your UI:**
   Choose from supported UI scripts: `mpv`, `mpv uosc`, `modernx`, `modernz`, or `mpv-easy`.

2. **Select extra features:**
   - `yt-dlp`: Play remote videos.
   - `ffmpeg`: Unlock advanced yt-dlp features.
   - `play-with`: Open the player from your browser.

3. **Add scripts:**
   Type keywords into the search box to find scripts, select the ones you want, and see them listed at the bottom.

4. **Download your MPV:**
   Hit the download button, wait a few minutes as the browser grabs the files and packs them into a zip, then extract the portable package to start enjoying your tailored MPV.

---

## How mpv-build works

Curious about the magic behind it? mpv-build keeps things simple and server-free:

- **Resource fetching:** All files come from GitHub via the [mpv-easy-cdn](https://github.com/mpv-easy/mpv-easy-cdn), dodging CORS issues since I don’t have the budget for a dedicated server.
- **Processing:** Once downloaded, WebAssembly (WASM) unpacks the files, installs your chosen scripts into the `portable_config` folder, and repacks everything into a zip.
- **Browser-based:** It all happens in your browser, keeping it fast and private.

---

## Benefits of mpv-build

mpv-build is convenient for different users:

- **For developers:**
   It creates a stable bug-testing environment. Download the same config on any machine, and if a plugin clash happens, it’s easy to reproduce and fix.

- **For beginners:**
   No config? No problem—you’ll get a origin MPV. Plus, using a GUI to add plugins and extensions beats wrestling with the command line any day.

---

## Future plans

mpv-build is a work in progress with big potential:

- **Script library:** Third-party script info lives in this [GitHub repo](https://github.com/mpv-easy/mpsm-scripts), parsed from [awesome-mpv](https://github.com/stax76/awesome-mpv). That’s over 400 scripts! Most haven’t been tested yet (time’s tight), and some haven’t been updated in years.
- **Script upgrades:** I’m planning to reimplement some scripts with `mpv-easy`. Lua scripts are tricky to bundle, but JavaScript ones? They pack into a single file, making management a breeze.


## Related Links

- https://mpv-easy.github.io/mpv-build/
- https://github.com/mpv-easy/mpsm-scripts
- https://github.com/mpv-easy/mpv-easy-cdn
