use crate::ops::new_runtime;
use deno_core::*;
use mpv_easy_client::{api::{get_property, wait_event}, client_dyn::lib::Event};
use std::collections::HashMap;

static mut GLOBAL_INSTANCE: Option<HashMap<String, JsRuntime>> = None;
pub fn init_deno_runtime(handle: HashMap<String, JsRuntime>) {
    unsafe { GLOBAL_INSTANCE = Some(handle) };
}

pub unsafe fn run_mp_scripts() {
    let dir: String = get_property("working-directory");

    let dir = std::path::Path::new(&dir);
    if !dir.exists() {
        return;
    }

    let config_dir = dir.join("portable_config");
    let script_dir = config_dir.join("scripts-deno");

    if !script_dir.exists() {
        return;
    }

    let file_list = script_dir.read_dir().unwrap();

    let mut runtime_map: HashMap<String, JsRuntime> = HashMap::new();

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

        let mut runtime = new_runtime();
        let code = format!(
            "globalThis.__script_name = `{}`;\n globalThis.__script_path = `{}`",
            name, p
        );
        let script_code = ModuleCodeString::from(code);
        runtime
            .execute_script("<inject-script-env>", script_code)
            .unwrap();

        runtime_map.insert(p, runtime);
    }

    init_deno_runtime(runtime_map);

    for (path, rt) in GLOBAL_INSTANCE.as_mut().unwrap() {
        let script_code = std::fs::read_to_string(path).unwrap();
        let script_code = ModuleCodeString::from(script_code);
        let polyfill_code = ModuleCodeString::from(polyfill_code.to_string());

        rt.execute_script("<polyfill.js>", polyfill_code)
            .expect("polyfill js error");

        let init_code = ModuleCodeString::from(init_code.clone());
        rt.execute_script("<init.js>", init_code)
            .expect("init js error");
        rt.execute_script(path, script_code)
            .expect("script js error");
    }

    loop {
        let event = wait_event(0.01);

        match event {
            Event::Shutdown => {
                return;
            }
            _ => {
                for (_, rt) in GLOBAL_INSTANCE.as_mut().unwrap() {
                    rt.execute_script_static("<loop>", "globalThis.__mp_tick?.()")
                        .unwrap();
                }
            }
        }
    }
}
