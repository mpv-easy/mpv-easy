use deno_core::*;
use mpv_easy_client::mpv;

#[op2]
fn op_commandv(#[serde] cmd: Vec<String>) -> bool {
    // println!("op_commandv {:?}", cmd);
    mpv::op_commandv(cmd)
}

#[op2]
#[string]
fn op_get_property_string(#[string] name: String) -> String {
    
    mpv::op_get_property_string(name)
}

#[op2(fast)]
fn op_command_string(#[string] cmd: String) -> bool {
    mpv::op_command_string(cmd)
}

#[op2(fast)]
fn op_set_property_bool(#[string] name: String, v: bool) -> bool {
    // println!("op_set_property_bool op11: {} {}", &name, v);
    mpv::op_set_property_bool(name, v)
}

#[op2(fast)]
fn op_set_property_number(#[string] name: String, v: f64) -> bool {
    // println!("op_set_property_number op11: {} {}", &name, v);
    mpv::op_set_property_number(name, v)
}
#[op2(fast)]
fn op_set_property_string(#[string] name: String, #[string] v: String) -> bool {
    // println!("op_set_property_string: {:?} {:?}", &name, v);
    mpv::op_set_property_string(name, v)
}

#[op2]
#[string]
fn op_get_cwd() -> String {
    let dir: String = mpv::op_get_cwd();
    dir
}

#[op2]
#[string]
fn op_read_file(#[string] path: String) -> Option<String> {
    
   mpv::op_read_file(path)
}

#[op2(fast)]
fn op_write_file(#[string] path: String, #[string] contents: String)   {
    mpv::op_write_file(path, contents);
}

#[op2]
fn op_file_size(#[string] path: String) -> Option<u32> {
    
    mpv::op_file_size(path)
}

#[op2(fast)]
fn op_file_exists(#[string] path: String) -> bool {
    
     mpv::op_file_exists(path)
}

#[op2(fast)]
fn op_is_file(#[string] path: String) -> bool {
    
     mpv::op_is_file(path)
}

#[op2]
#[serde]
fn op_read_dir(
    #[string] path: String,
    #[string] filter: Option<String>,
) -> Option<Vec<String>> {
    
    mpv::op_read_dir(path, filter)
}

#[op2]
#[string]
fn op_command_native(#[string] name: String, #[serde] args: Vec<String>) -> Option<String> {
    
    mpv::op_command_native(name, args)
}

#[op2]
#[string]
fn op_command_json(#[string] json: String) -> Option<String> {
    let js = mpv::op_command_json(json);
    
    js.map(|i| i.to_string())
}

#[op2]
fn op_command_native_async(#[string] name: String, #[serde] args: Vec<String>) {
    mpv::op_command_native_async(name, args);
}

#[op2]
#[string]
fn op_getenv(#[string] path: String) -> Option<String> {
    
    mpv::op_getenv(path)
}

pub fn new_runtime() -> JsRuntime {
    const OPS: [OpDecl; 16] = [
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
        op_getenv(),
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
