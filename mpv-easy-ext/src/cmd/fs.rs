use super::cli::Cmd;

#[derive(clap::Parser, Debug)]
pub struct Fs {
    #[clap(required = true)]
    cmd: String,

    #[clap(required = true)]
    path: String,
}

impl Cmd for Fs {
    fn call(&self) {
        let cmd = self.cmd.as_str();
        let path: &str = serde_json::from_str(self.path.as_str()).unwrap();

        // println!("rs path: {} {} ", cmd, path);
        match cmd {
            "mkdir" => {
                std::fs::create_dir_all(path).unwrap();
            }
            "remove_file" => {
                std::fs::remove_file(path).unwrap();
            }
            "remove_dir_all" => {
                std::fs::remove_dir_all(path).unwrap();
            }
            "remove_dir" => {
                std::fs::remove_dir(path).unwrap();
            }
            _ => {
                panic!("fs not support cmd: {} {}", cmd, path);
            }
        }
    }
}
