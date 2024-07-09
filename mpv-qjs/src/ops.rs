fn op_commandv(cmd: Vec<String>) {
    commandv(cmd);
}

fn op_get_property_string(name: String) -> String {
    get_property_string(name)
}

fn op_command_string(cmd: String) {
    commandv(cmd.split(' '));
}

fn op_set_property_bool(name: String, v: bool) {
    set_property_bool(name, v);
}

fn op_set_property_number(name: String, v: f64) {
    set_property_number(name, v);
}
fn op_set_property_string(name: String, v: String) {
    set_property_string(name, v);
}

fn op_get_cwd() -> String {
    let dir: String = get_property("working-directory");
    dir
}

fn op_read_file(path: String) -> String {
    let text: String = std::fs::read_to_string(path).unwrap();
    text
}

fn op_write_file(path: String, contents: String) {
    std::fs::write(path, contents).unwrap();
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

fn op_command_native_async(name: String, args: Vec<String>) {
    std::thread::spawn(move || {
        exec_command(name, args);
    });
}

use std::process::Command;

use mpv_easy_client::api::{
    command_json, commandv, get_property, get_property_string, set_property_bool,
    set_property_number, set_property_string,
};
use rquickjs::{Context, Function, Runtime, Value};

fn op_print(msg: String) -> String {
    print!("{msg}");
    msg
}

pub fn new_context() -> Context {
    let rt = Runtime::new().unwrap();
    rt.set_max_stack_size(256 * 1024 * 1024);
    // rt.set_memory_limit(0);
    let ctx = Context::full(&rt).unwrap();
    let mut op_list = vec![];
    std::mem::forget(rt);
    ctx.with(|ctx| {
        let global = ctx.globals();

        macro_rules! add_op {
    (
        $($id:ident) *
    ) => {
$(
  let s =  stringify! ($id);

          global
            .set(
                s,
                Function::new(ctx.clone(), $id )
                    .unwrap()
                    .with_name(s)
                    .unwrap(),
            )
            .unwrap();
          op_list.push(s);
)*

    };
}

        add_op!(
          op_print
          op_commandv
          op_get_property_string
          op_command_string
          op_set_property_bool
          op_set_property_number
          op_set_property_string
          op_get_cwd
          op_read_file
          op_write_file
          op_file_size
          op_file_exists
          op_is_file op_read_dir
          op_command_native
          op_command_json
          op_command_native_async
        );

        let op_str = op_list
            .into_iter()
            .map(|i| format!("ops.{} = globalThis.{};", i, i))
            .collect::<Vec<_>>()
            .join("\n");

        let code = format!(
            r#"
const Deno = {{}};
const core = {{}};
const ops = {{}};

{op_str}

core.ops = ops;
Deno.core = core;
core.print = globalThis.op_print

globalThis.Deno = Deno;
          "#
        );
        let _v: Value = ctx.eval(code).unwrap();
    });
    ctx
}
