#![feature(let_chains)]
#![feature(associated_type_defaults)]

mod cmd;
use cmd::cli::start;

fn main() {
    // if std::env::var("RUST_BACKTRACE").is_err() {
    //     std::env::set_var("RUST_BACKTRACE", "full");
    // }
    // color_eyre::install().unwrap();
    start();
}
