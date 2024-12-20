use deno_core::*;
use mpv_easy_client::mpv;

#[op2]
fn op_commandv(#[serde] cmd: Vec<String>) -> Result<(), deno_core::error::AnyError> {
    // println!("op_commandv {:?}", cmd);
    mpv::op_commandv(cmd);
    Ok(())
}

#[op2]
#[string]
fn op_get_property_string(#[string] name: String) -> Result<String, deno_core::error::AnyError> {
    let v = mpv::op_get_property_string(name);
    Ok(v)
}

#[op2(fast)]
fn op_command_string(#[string] cmd: String) -> Result<(), deno_core::error::AnyError> {
    mpv::op_command_string(cmd);
    Ok(())
}

#[op2(fast)]
fn op_set_property_bool(#[string] name: String, v: bool) -> Result<(), deno_core::error::AnyError> {
    // println!("op_set_property_bool op11: {} {}", &name, v);
    mpv::op_set_property_bool(name, v);
    Ok(())
}

#[op2(fast)]
fn op_set_property_number(
    #[string] name: String,
    v: f64,
) -> Result<(), deno_core::error::AnyError> {
    // println!("op_set_property_number op11: {} {}", &name, v);
    mpv::op_set_property_number(name, v);
    Ok(())
}
#[op2(fast)]
fn op_set_property_string(
    #[string] name: String,
    #[string] v: String,
) -> Result<(), deno_core::error::AnyError> {
    // println!("op_set_property_string: {:?} {:?}", &name, v);
    mpv::op_set_property_string(name, v);
    Ok(())
}

#[op2]
#[string]
fn op_get_cwd() -> Result<String, deno_core::error::AnyError> {
    let dir: String = mpv::op_get_cwd();
    Ok(dir)
}

#[op2]
#[string]
fn op_read_file(#[string] path: String) -> Result<String, deno_core::error::AnyError> {
    let text: String = mpv::op_read_file(path);
    Ok(text)
}

#[op2(fast)]
fn op_write_file(
    #[string] path: String,
    #[string] contents: String,
) -> Result<(), deno_core::error::AnyError> {
    mpv::op_write_file(path, contents);
    Ok(())
}

#[op2(fast)]
fn op_file_size(#[string] path: String) -> Result<u32, deno_core::error::AnyError> {
    let size = mpv::op_file_size(path);
    Ok(size)
}

#[op2(fast)]
fn op_file_exists(#[string] path: String) -> Result<bool, deno_core::error::AnyError> {
    let p = mpv::op_file_exists(path);
    Ok(p)
}

#[op2(fast)]
fn op_is_file(#[string] path: String) -> Result<bool, deno_core::error::AnyError> {
    let p = mpv::op_is_file(path);
    Ok(p)
}

#[op2]
#[serde]
fn op_read_dir(
    #[string] path: String,
    #[string] filter: Option<String>,
) -> Result<Vec<String>, deno_core::error::AnyError> {
    let v: Vec<String> = mpv::op_read_dir(path, filter);
    Ok(v)
}

#[op2]
#[string]
fn op_command_native(
    #[string] name: String,
    #[serde] args: Vec<String>,
) -> Result<String, deno_core::error::AnyError> {
    let stdout = mpv::op_command_native(name, args);
    Ok(stdout)
}

#[op2]
#[string]
fn op_command_json(#[string] json: String) -> Result<String, deno_core::error::AnyError> {
    let js = mpv::op_command_json(json);
    let s = js.to_string();
    Ok(s)
}

#[op2]
fn op_command_native_async(
    #[string] name: String,
    #[serde] args: Vec<String>,
) -> Result<(), deno_core::error::AnyError> {
    std::thread::spawn(move || {
        mpv::op_command_native_async(name, args);
    });
    Ok(())
}

#[op2]
#[string]
fn op_getenv(#[string] path: String) -> Result<Option<String>, deno_core::error::AnyError> {
    let env = mpv::op_getenv(path);
    Ok(env)
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
