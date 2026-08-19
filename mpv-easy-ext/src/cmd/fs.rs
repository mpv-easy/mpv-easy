use super::cli::Cmd;
use crate::error::{Error, Result};

#[derive(clap::Parser, Debug)]
pub struct Fs {
    #[clap(required = true)]
    cmd: String,

    #[clap(required = true)]
    path: String,
}

impl Cmd for Fs {
    fn call(&self) -> Result<()> {
        let cmd = self.cmd.as_str();
        let path: &str = serde_json::from_str(self.path.as_str())?;

        // println!("rs path: {} {} ", cmd, path);
        match cmd {
            "mkdir" => {
                std::fs::create_dir_all(path)?;
            }
            "remove_file" => {
                std::fs::remove_file(path)?;
            }
            "remove_dir_all" => {
                std::fs::remove_dir_all(path)?;
            }
            "remove_dir" => {
                std::fs::remove_dir(path)?;
            }
            _ => {
                return Err(Error::Other(format!("fs not support cmd: {} {}", cmd, path)));
            }
        }
        Ok(())
    }
}
