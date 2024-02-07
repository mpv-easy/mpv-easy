#[cfg(target_os = "macos")]
use crate::cmd::clip::clip_mac::{get_image, get_text, set_image, set_text};
#[cfg(target_os = "windows")]
use crate::cmd::clip::clip_win::{get_image, get_text, set_image, set_text};

#[cfg(target_os = "linux")]
use crate::cmd::clip::clip_linux::{get_image, get_text, set_image, set_text};

use super::cli::Cmd;

#[derive(clap::Parser, Debug)]
pub struct Clipboard {
    #[clap(required = true)]
    cmd: String,

    #[clap(required = false, default_value_t = String::new())]
    text: String,
}

impl Cmd for Clipboard {
    fn call(&self) {
        let cmd = self.cmd.as_str();

        // println!("{:?} {:?}", cmd, text);

        match cmd {
            "set" => {
                let text = serde_json::from_str(self.text.as_str()).unwrap();

                set_text(text)
            }
            "get" => {
                let s = get_text();
                println!("{}", serde_json::to_string(&s).unwrap());
            }
            "set-image" => {
                let text = serde_json::from_str(self.text.as_str()).unwrap();
                set_image(text);
            }
            "get-image" => {
                get_image();
            }
            _ => {
                let text: &str = serde_json::from_str(self.text.as_str()).unwrap();
                panic!("clipboard not support cmd: {} {}", cmd, text);
            }
        }
    }
}
