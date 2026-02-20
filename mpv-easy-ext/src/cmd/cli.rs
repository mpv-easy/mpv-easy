use clap::Parser;
use enum_dispatch::enum_dispatch;

#[enum_dispatch(SubCommand)]
pub trait Cmd {
    fn call(&self) -> anyhow::Result<()>;
}

use super::{
    clipboard::Clipboard, completion::Completion, fetch::Fetch, fs::Fs, jellyfin::Jellyfin,
    webdav::Webdav, img::Img, wget::Wget,
};

#[derive(clap::Parser, Debug)]
#[enum_dispatch]
pub enum SubCommand {
    Fs(Fs),

    Clipboard(Clipboard),

    Completion(Completion),

    Fetch(Fetch),

    Webdav(Webdav),

    Jellyfin(Jellyfin),
    Img(Img),
    Wget(Wget),
}

#[derive(clap::Parser, Debug)]
#[clap(name = "rs-ext", version = env!("CARGO_PKG_VERSION"), )]
pub struct Cli {
    #[clap(subcommand)]
    pub subcmd: SubCommand,
}

pub fn start() -> anyhow::Result<()> {
    let cli = Cli::parse();

    let cmd: SubCommand = cli.subcmd;
    cmd.call()
}
