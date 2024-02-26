fn op_commandv(cmd: Vec<String>) -> i32 {
    commandv(cmd);
    0
}

fn op_get_property_string(name: String) -> String {
    get_property_string(name)
}

fn op_command_string(cmd: String) -> i32 {
    // op_get_property_string.call(args)
    commandv(cmd.split(' '));
    0
}

fn op_set_property_bool(name: String, v: bool) -> i32 {
    // println!("op_set_property_bool op11: {} {}", &name, v);
    set_property_bool(name, v);
    0
}

fn op_set_property_number(name: String, v: f64) -> i32 {
    // println!("op_set_property_number op11: {} {}", &name, v);
    set_property_number(name, v);
    0
}
fn op_set_property_string(name: String, v: String) -> i32 {
    // println!("op_set_property_string op11: {} {}", &name, v);
    set_property_string(name, v);
    0
}

fn op_get_cwd() -> String {
    let dir: String = get_property("working-directory");
    dir
}

fn op_read_file(path: String) -> String {
    let text: String = std::fs::read_to_string(path).unwrap();
    text
}

fn op_write_file(path: String, contents: String) -> i32 {
    std::fs::write(path, contents).unwrap();
    0
}

fn op_file_size(path: String) -> u32 {
    let size = std::fs::read(path).unwrap_or_default().len();
    size as u32
}

fn op_file_exists(path: String) -> bool {
    let p = std::path::PathBuf::from(&path);
    p.exists()
}

fn op_is_file(path: String) -> bool {
    let p = std::path::PathBuf::from(&path);
    p.is_file()
}

fn op_read_dir(path: String) -> Vec<String> {
    let p = std::path::PathBuf::from(&path);
    let v: Vec<String> = p
        .read_dir()
        .unwrap()
        .filter_map(|i| i.ok().map(|k| k.path().to_string_lossy().to_string()))
        .collect();
    v
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

fn op_command_native(name: String, args: Vec<String>) -> String {
    exec_command(name, args)
}

fn op_command_json(args: Vec<String>) -> String {
    let js = command_json(args);

    js.to_string()
}

fn op_command_native_async(name: String, args: Vec<String>) -> i32 {
    std::thread::spawn(move || {
        exec_command(name, args);
    });
    0
}

use std::process::Command;

use mpv_easy_client::api::{
    command_json, commandv, get_property, get_property_string, set_property_bool,
    set_property_number, set_property_string,
};
use quickjs_rs::Context;
// use rquickjs::{Context, Function, Object, Runtime};

fn print(msg: String) -> String {
    print!("{msg}");
    msg
}

pub fn new_context() -> Context {
    let ctx = Context::new().unwrap();

    ctx.add_callback("op_print", print).unwrap();
    ctx.add_callback("op_commandv", op_commandv).unwrap();
    ctx.add_callback("op_get_property_string", op_get_property_string)
        .unwrap();
    ctx.add_callback("op_command_string", op_command_string)
        .unwrap();
    ctx.add_callback("op_set_property_bool", op_set_property_bool)
        .unwrap();
    ctx.add_callback("op_set_property_number", op_set_property_number)
        .unwrap();
    ctx.add_callback("op_set_property_string", op_set_property_string)
        .unwrap();
    ctx.add_callback("op_get_cwd", op_get_cwd).unwrap();
    ctx.add_callback("op_read_file", op_read_file).unwrap();
    ctx.add_callback("op_write_file", op_write_file).unwrap();
    ctx.add_callback("op_file_size", op_file_size).unwrap();
    ctx.add_callback("op_file_exists", op_file_exists).unwrap();
    ctx.add_callback("op_is_file", op_is_file).unwrap();
    ctx.add_callback("op_read_dir", op_read_dir).unwrap();
    ctx.add_callback("op_command_native", op_command_native)
        .unwrap();
    ctx.add_callback("op_command_json", op_command_json)
        .unwrap();
    ctx.add_callback("op_command_native_async", op_command_native_async)
        .unwrap();
    ctx.eval(r#"{
          const Deno = {};
          const core = {};
          const ops = {};

          ops.op_print = globalThis.op_print;
          ops.op_commandv = globalThis.op_commandv;
          ops.op_get_property_string = globalThis.op_get_property_string;
          ops.op_command_string = globalThis.op_command_string;
          ops.op_set_property_bool = globalThis.op_set_property_bool;
          ops.op_set_property_number = globalThis.op_set_property_number;
          ops.op_set_property_string = globalThis.op_set_property_string;
          ops.op_get_cwd = globalThis.op_get_cwd;
          ops.op_read_file = globalThis.op_read_file;
          ops.op_write_file = globalThis.op_write_file;
          ops.op_file_size = globalThis.op_file_size;
          ops.op_file_exists = globalThis.op_file_exists;
          ops.op_is_file = globalThis.op_is_file;
          ops.op_read_dir = globalThis.op_read_dir;
          ops.op_command_native = globalThis.op_command_native;
          ops.op_command_json = globalThis.op_command_json;
          ops.op_command_native_async = globalThis.op_command_native_async;

          core.ops = ops;
          Deno.core = core;
          core.print = globalThis.op_print

          globalThis.Deno = Deno;
        }"#).unwrap();
    ctx
}
