#![feature(let_chains)]
#![feature(associated_type_defaults)]

mod cmd;
use cmd::cli::start;

fn main() {
    start();
}
