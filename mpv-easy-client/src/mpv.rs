use crate::api::{
    command_json, commandv, get_property, get_property_string, set_property_bool,
    set_property_number, set_property_string,
};
use std::process::Command;

pub fn op_commandv(cmd: Vec<String>) -> bool {
    commandv(cmd)
}

pub fn op_get_property_string(name: String) -> String {
    get_property_string(name)
}

pub fn op_command_string(cmd: String) -> bool {
    commandv(cmd.split(' '))
}

pub fn op_set_property_bool(name: String, v: bool) -> bool {
    set_property_bool(name, v)
}

pub fn op_set_property_number(name: String, v: f64) -> bool {
    set_property_number(name, v)
}
pub fn op_set_property_string(name: String, v: String) -> bool {
    set_property_string(name, v)
}

pub fn op_get_cwd() -> String {
    let dir: String = get_property("working-directory");
    dir
}

pub fn op_read_file(path: String) -> Option<String> {
    // println!("op_read_file {:?}", path);
    std::fs::read_to_string(path).ok()
}

pub fn op_write_file(path: String, contents: String) -> bool {
    std::fs::write(path, contents).is_ok()
}

pub fn op_file_size(path: String) -> Option<u32> {
    std::fs::read(path).ok().map(|i| i.len() as u32)
}

pub fn op_file_exists(path: String) -> bool {
    let p = std::path::PathBuf::from(&path);
    p.exists()
}

pub fn op_is_file(path: String) -> bool {
    let p = std::path::PathBuf::from(&path);
    p.is_file()
}
pub fn op_getenv(name: String) -> Option<String> {
    std::env::var(name).ok()
}
pub fn op_read_dir(path: String, filter: Option<String>) -> Option<Vec<String>> {
    let mut files = vec![];
    let mut dirs = vec![];
    let mut others = vec![];

    let p = std::path::PathBuf::from(&path);

    for i in p.read_dir().ok()? {
        if let Ok(k) = i {
            let meta = k.metadata().ok()?;
            let name = k.path().file_name()?.to_string_lossy().to_string();
            if meta.is_dir() {
                dirs.push(name);
            } else if meta.is_file() {
                files.push(name);
            } else if meta.is_symlink() {
                others.push(name);
            }
        }
    }

    Some(match filter.unwrap_or_default().as_str() {
        "files" => files,
        "dirs" => dirs,
        "all" => [files, dirs, others].concat(),
        "normal" | _ => [files, dirs].concat(),
    })
}

fn exec_command(name: String, args: Vec<String>) -> Option<String> {
    let empty_args: Vec<String> = vec![];
    let (cmd_name, cmd_args) = if name == "subprocess" {
        if args.len() == 1 {
            (&args[0], empty_args.as_slice())
        } else {
            args.split_first()?
        }
    } else {
        (&name, args.as_slice())
    };

    // println!("cmd_args: {:?} {:?} {:?}", cmd_name, name, cmd_args);
    let output = Command::new(cmd_name).args(cmd_args).output().ok()?;

    String::from_utf8(output.stdout).ok()
}

pub fn op_command_native(name: String, args: Vec<String>) -> Option<String> {
    exec_command(name, args)
}

pub fn op_command_json(args: String) -> Option<String> {
    // println!("op_command_json {:?}", args);
    let v: Vec<serde_json::Value> = serde_json::from_str(&args).ok()?;
    let js = command_json(v);
    js.map(|i| i.to_string())
}

async fn exec_command_async(name: String, args: Vec<String>) -> Option<String> {
    let empty_args: Vec<String> = vec![];
    let (cmd_name, cmd_args) = if name == "subprocess" {
        if args.len() == 1 {
            (&args[0], empty_args.as_slice())
        } else {
            args.split_first()?
        }
    } else {
        (&name, args.as_slice())
    };

    // println!("cmd_args: {:?} {:?} {:?}", cmd_name, name, cmd_args);
    let output = tokio::process::Command::new(cmd_name)
        .args(cmd_args)
        .output()
        .await
        .ok()?;
    String::from_utf8(output.stdout).ok()
}

// TODO
// pub async fn op_command_native_async(name: String, args: Vec<String>) -> Option<String> {
//     exec_command_async(name, args).await
// }

pub fn op_command_native_async(name: String, args: Vec<String>) {
    std::thread::spawn(move || {
        op_command_native(name, args);
    });
}

pub fn op_print(msg: String) -> String {
    print!("{msg}");
    msg
}
