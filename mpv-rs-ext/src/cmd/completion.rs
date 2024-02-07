use std::io;

use clap::CommandFactory;
use clap_complete::{generate, Shell};

use super::cli::{Cli, Cmd};

#[derive(clap::Parser, Debug)]
pub struct Completion {
    #[clap(required = true, value_enum)]
    shell: Shell,
}

impl Cmd for Completion {
    fn call(&self) {
        let mut cmd = Cli::command();
        let name = cmd.get_name().to_string();

        generate(self.shell, &mut cmd, name, &mut io::stdout());
    }
}
