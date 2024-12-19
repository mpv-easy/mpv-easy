use mpv_easy_client::mpv::*;
use rquickjs::{Context, Function, Runtime, Value};

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
