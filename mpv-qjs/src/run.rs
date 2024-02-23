use crate::ops::new_context;
use mpv_easy_client::{
    api::{get_property, wait_event},
    client_dyn::lib::Event,
};
// use rquickjs::Context;

use quickjs_rs::Context;

use std::collections::HashMap;

static mut GLOBAL_INSTANCE: Option<HashMap<String, Context>> = None;
pub fn init_deno_runtime(handle: HashMap<String, Context>) {
    unsafe { GLOBAL_INSTANCE = Some(handle) };
}

pub unsafe fn run_mp_scripts() {
    let dir: String = get_property("working-directory");

    let dir = std::path::Path::new(&dir);
    if !dir.exists() {
        return;
    }

    let config_dir = dir.join("portable_config");
    let script_dir = config_dir.join("scripts-qjs");

    if !script_dir.exists() {
        return;
    }

    let file_list = script_dir.read_dir().unwrap();

    let mut runtime_map: HashMap<String, Context> = HashMap::new();

    let init_path = script_dir.join("init.js");
    let polyfill_path = script_dir.join("polyfill.js");
    let default_init_code = include_str!("../dist/init.js");
    let default_polyfill_code = include_str!("../dist/polyfill.js");

    let init_code = if init_path.exists() {
        std::fs::read_to_string(&init_path).unwrap()
    } else {
        default_init_code.to_string()
    };
    let polyfill_code = if polyfill_path.exists() {
        std::fs::read_to_string(&polyfill_path).unwrap()
    } else {
        default_polyfill_code.to_string()
    };

    for i in file_list.filter_map(|i| i.ok()) {
        let name = i.file_name().to_str().unwrap().to_string();
        let p = script_dir
            .join(&name)
            .to_string_lossy()
            .to_string()
            .replace("\\\\", "/")
            .replace('\\', "/");

        if name == "init.js" || name == "polyfill.js" || !name.ends_with(".js") {
            continue;
        }

        let ctx = new_context();
        let code = format!(
            "globalThis.__script_name = `{}`;\n globalThis.__script_path = `{}`",
            name, p
        );

        ctx.eval(&code).unwrap();

        runtime_map.insert(p, ctx);
    }

    init_deno_runtime(runtime_map);

    for (path, ctx) in GLOBAL_INSTANCE.as_mut().unwrap() {
        let script_code = std::fs::read_to_string(path).unwrap();
        let polyfill_code = polyfill_code.to_string();
        let init_code = init_code.clone();

        ctx.eval(&polyfill_code).unwrap();
        ctx.eval(&init_code).unwrap();
        ctx.eval(&script_code).unwrap();
    }

    loop {
        let event = wait_event(1.);
        match event {
            Event::Shutdown => {
                return;
            }
            _ => {
                for (_, ctx) in GLOBAL_INSTANCE.as_mut().unwrap() {
                    let e = ctx.eval(
                        r#"
                        try{
                          globalThis.__mp_tick?.()
                        }catch(e){
                          globalThis.print(e)
                        }

                        "#,
                    );
                    match e {
                        Err(e) => {
                            println!("error: {}", e);
                        }
                        _ => {}
                    }
                }
            }
        }
    }
}
