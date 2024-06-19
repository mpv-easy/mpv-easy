use super::cli::Cmd;

#[derive(clap::Parser, Debug)]
pub struct Clipboard {
    #[clap(required = true)]
    cmd: String,

    #[clap(required = false, default_value_t = String::new())]
    text: String,
}

#[cfg(not(target_os = "android"))]
mod clip {
    use clipboard_rs::{common::RustImage, Clipboard as _, ClipboardContext};
    pub fn set_text(text: &str) {
        let ctx = ClipboardContext::new().unwrap();
        ctx.set_text(text.to_string()).unwrap();
    }

    pub fn get_text() -> String {
        let ctx = ClipboardContext::new().unwrap();
        ctx.get_text().unwrap()
    }

    pub fn set_image(path: &str) {
        let ctx = ClipboardContext::new().unwrap();
        let img = RustImage::from_path(path).unwrap();
        ctx.set_image(img).unwrap();
    }
}
#[cfg(target_os = "android")]
mod clip {
    pub fn set_text(text: &str) {
        todo!()
    }

    pub fn get_text() -> String {
        todo!()
    }

    pub fn set_image(path: &str) {
        todo!()
    }
}

pub fn get_image() {
    todo!()
}

impl Cmd for Clipboard {
    fn call(&self) {
        use base64::prelude::*;

        let cmd = self.cmd.as_str();

        match cmd {
            "set" => {
                let b64: String = serde_json::from_str(self.text.as_str()).unwrap();
                let bin = BASE64_STANDARD.decode(b64).unwrap();
                let text = String::from_utf8_lossy(&bin);
                clip::set_text(&text)
            }
            "get" => {
                let s = clip::get_text();
                println!("{}", serde_json::to_string(&s).unwrap());
            }
            "set-image" => {
                let text = serde_json::from_str(self.text.as_str()).unwrap();
                clip::set_image(text);
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
