use crate::api::{
    command_json, commandv, get_property, get_property_string, set_property_bool,
    set_property_number, set_property_string,
};
use std::process::Command;

pub fn op_commandv(cmd: Vec<String>) {
    commandv(cmd);
}

pub fn op_get_property_string(name: String) -> String {
    get_property_string(name)
}

pub fn op_command_string(cmd: String) {
    commandv(cmd.split(' '));
}

pub fn op_set_property_bool(name: String, v: bool) {
    set_property_bool(name, v);
}

pub fn op_set_property_number(name: String, v: f64) {
    set_property_number(name, v);
}
pub fn op_set_property_string(name: String, v: String) {
    set_property_string(name, v);
}

pub fn op_get_cwd() -> String {
    let dir: String = get_property("working-directory");
    dir
}

pub fn op_read_file(path: String) -> String {
    let text: String = std::fs::read_to_string(path).unwrap();
    text
}

pub fn op_write_file(path: String, contents: String) {
    std::fs::write(path, contents).unwrap();
}

pub fn op_file_size(path: String) -> u32 {
    let size = std::fs::read(path).unwrap_or_default().len();
    size as u32
}

pub fn op_file_exists(path: String) -> bool {
    let p = std::path::PathBuf::from(&path);
    p.exists()
}

pub fn op_is_file(path: String) -> bool {
    let p = std::path::PathBuf::from(&path);
    p.is_file()
}

pub fn op_read_dir(path: String) -> Vec<String> {
    let p = std::path::PathBuf::from(&path);
    let v: Vec<String> = p
        .read_dir()
        .unwrap()
        .filter_map(|i| i.ok().map(|k| k.path().to_string_lossy().to_string()))
        .collect();
    v
}

pub fn exec_command(name: String, args: Vec<String>) -> String {
    let empty_args = vec![String::new()];
    let (cmd_name, cmd_args) = if name == "subprocess" {
        if args.len() == 1 {
            (&args[0], empty_args.as_slice())
        } else {
            args.split_first().unwrap()
        }
    } else {
        (&name, args.as_slice())
    };
    let output = Command::new(cmd_name).args(cmd_args).output().unwrap();

    String::from_utf8(output.stdout).unwrap()
}

pub fn op_command_native(name: String, args: Vec<String>) -> String {
    exec_command(name, args)
}

pub fn op_command_json(args: Vec<String>) -> String {
    let js = command_json(args);

    js.to_string()
}

pub fn op_command_native_async(name: String, args: Vec<String>) {
    std::thread::spawn(move || {
        exec_command(name, args);
    });
}

pub fn op_print(msg: String) -> String {
    print!("{msg}");
    msg
}
