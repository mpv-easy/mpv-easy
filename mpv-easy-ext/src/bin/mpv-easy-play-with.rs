//! `mpv-easy-play-with`: registers the "play with" URL protocol, or opens a
//! video via that protocol.
//!
//! Console behavior (resolved at runtime via [`consolex`]):
//!
//! * **Inside an existing terminal** — behaves as a normal CLI program; the
//!   output goes to that terminal.
//! * **`--show`** — always opens a new console window to display output,
//!   even when launched from an existing terminal.
//! * **`--hide`** — hides all output and any console window; the requested
//!   operation still runs silently.
//! * **No flags, no terminal** (double-clicked / third-party) — opens a new
//!   console window to display output.

#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]
// `consolex` and `proto-reg` are Windows-only, so this binary only builds
// on Windows.
#![cfg(target_os = "windows")]

use consolex::{Mode, init, wait_key};
use mpv_easy_ext::{
    common::{Player, set_play_with_hook},
    error::{Error, Result},
    playwith::play_with,
};

fn main() -> Result<()> {
    // Collect the console mode from the arguments (`--show`/`--hide`, or
    // [`Mode::Auto`] by default). `--pause` is unused here. The rest stay
    // positional. `init` applies the mode and reports whether a new console
    // window was created.
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mode: Mode = args.iter().collect();
    let created = init(mode)?;

    // Do the actual work regardless of the console outcome; `--hide` only
    // suppresses output, not the operation itself.
    let result: Result<Player> = match (args.first().cloned(), args.get(1).cloned()) {
        (Some(exe_path), Some(b64)) => play_with(exe_path, b64),
        (exe_path, None) => set_play_with_hook(exe_path),
        _ => Err(Error::Other("mpv-easy-play-with not support yet!".into())),
    };

    if let Err(e) = &result {
        eprintln!("{e:?}");
    }

    let player = result?;
    let key = player.play_with_hkey();
    if let Ok(Some(item)) = proto_reg::ProtocolManager::query(key) {
        println!("{item}");
    }

    // Keep a newly created window open long enough to read the output.
    if created {
        let _ = wait_key();
    }

    Ok(())
}
