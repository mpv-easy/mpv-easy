use api::{commandv, get_property};
use deno_core::*;
use mpv_easy_client::api::{
    self, command_json, get_property_string, set_property_bool, set_property_number,
    set_property_string,
};
use std::process::Command;

#[op2]
fn op_commandv(#[serde] cmd: Vec<String>) -> Result<(), deno_core::error::AnyError> {
    commandv(cmd);
    Ok(())
}

#[op2]
#[string]
fn op_get_property_string(#[string] name: String) -> Result<String, deno_core::error::AnyError> {
    let v = get_property_string(name);
    Ok(v)
}

#[op2(fast)]
fn op_command_string(#[string] cmd: String) -> Result<(), deno_core::error::AnyError> {
    commandv(cmd.split(' '));
    Ok(())
}

#[op2(fast)]
fn op_set_property_bool(#[string] name: String, v: bool) -> Result<(), deno_core::error::AnyError> {
    // println!("op_set_property_bool op11: {} {}", &name, v);
    set_property_bool(name, v);
    Ok(())
}

#[op2(fast)]
fn op_set_property_number(
    #[string] name: String,
    v: f64,
) -> Result<(), deno_core::error::AnyError> {
    // println!("op_set_property_number op11: {} {}", &name, v);
    set_property_number(name, v);
    Ok(())
}
#[op2(fast)]
fn op_set_property_string(
    #[string] name: String,
    #[string] v: String,
) -> Result<(), deno_core::error::AnyError> {
    // println!("op_set_property_string op11: {} {}", &name, v);
    set_property_string(name, v);
    Ok(())
}

#[op2]
#[string]
fn op_get_cwd() -> Result<String, deno_core::error::AnyError> {
    let dir: String = get_property("working-directory");
    Ok(dir)
}

#[op2]
#[string]
fn op_read_file(#[string] path: String) -> Result<String, deno_core::error::AnyError> {
    let text: String = std::fs::read_to_string(path).unwrap();
    Ok(text)
}

#[op2(fast)]
fn op_write_file(
    #[string] path: String,
    #[string] contents: String,
) -> Result<(), deno_core::error::AnyError> {
    std::fs::write(path, contents).unwrap();
    Ok(())
}

#[op2(fast)]
fn op_file_size(#[string] path: String) -> Result<u32, deno_core::error::AnyError> {
    let size = std::fs::read(path).unwrap_or_default().len();
    Ok(size as u32)
}

#[op2(fast)]
fn op_file_exists(#[string] path: String) -> Result<bool, deno_core::error::AnyError> {
    let p = std::path::PathBuf::from(&path);
    Ok(p.exists())
}

#[op2(fast)]
fn op_is_file(#[string] path: String) -> Result<bool, deno_core::error::AnyError> {
    let p = std::path::PathBuf::from(&path);
    Ok(p.is_file())
}

#[op2]
#[serde]
fn op_read_dir(#[string] path: String) -> Result<Vec<String>, deno_core::error::AnyError> {
    let p = std::path::PathBuf::from(&path);
    let v: Vec<String> = p
        .read_dir()
        .unwrap()
        .filter_map(|i| i.ok().map(|k| k.path().to_string_lossy().to_string()))
        .collect();
    Ok(v)
}

fn exec_command(name: String, args: Vec<String>) -> String {
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

#[op2]
#[string]
fn op_command_native(
    #[string] name: String,
    #[serde] args: Vec<String>,
) -> Result<String, deno_core::error::AnyError> {
    let stdout = exec_command(name, args);
    Ok(stdout)
}

#[op2]
#[string]
fn op_command_json(#[serde] args: Vec<String>) -> Result<String, deno_core::error::AnyError> {
    let js = command_json(args);
    let s = js.to_string();
    Ok(s)
}

#[op2]
fn op_command_native_async(
    #[string] name: String,
    #[serde] args: Vec<String>,
) -> Result<(), deno_core::error::AnyError> {
    std::thread::spawn(move || {
        exec_command(name, args);
    });
    Ok(())
}

pub fn new_runtime() -> JsRuntime {
    const OPS: [OpDecl; 15] = [
        op_commandv(),
        op_command_string(),
        op_get_property_string(),
        op_set_property_bool(),
        op_set_property_number(),
        op_set_property_string(),
        op_read_file(),
        op_write_file(),
        op_file_size(),
        op_file_exists(),
        op_is_file(),
        op_read_dir(),
        op_command_native(),
        op_command_native_async(),
        op_command_json(),
    ];
    let ext = Extension {
        name: "mpv_ext",
        ops: std::borrow::Cow::Borrowed(&OPS),
        ..Default::default()
    };

    JsRuntime::new(RuntimeOptions {
        extensions: vec![ext],
        ..Default::default()
    })
}
