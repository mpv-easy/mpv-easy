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

fn op_file_size(path: String) -> i32 {
    let size = std::fs::read(path).unwrap_or_default().len();
    size as i32
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

use boa_engine::{js_string, property::Attribute, Context, JsResult, Source};
use mpv_easy_client::api::{
    command_json, commandv, get_property, get_property_string, set_property_bool,
    set_property_number, set_property_string,
};

fn op_print(msg: String) -> String {
    print!("{msg}");
    msg
}

use boa_engine::object::builtins::JsArray;
use boa_engine::value::TryFromJs;
use boa_engine::NativeFunction;
use boa_engine::{object::FunctionObjectBuilder, JsValue};

trait IntoJs {
    fn into_js(&self, context: &mut Context) -> JsValue;
}

#[derive(Debug, Clone)]
enum Value {
    Null,
    Undefined,
    Bool(bool),
    Number(i32),
    String(String),
    Float(f64),
    Array(Vec<Value>),
}

trait FromJs {
    fn from_js(&self, context: &mut Context) -> Value;
}

impl FromJs for JsValue {
    fn from_js(&self, context: &mut Context) -> Value {
        match self {
            JsValue::Null => Value::Null,
            JsValue::Undefined => Value::Undefined,
            JsValue::Boolean(b) => Value::Bool(*b),
            JsValue::String(s) => Value::String(s.to_std_string().unwrap()),
            JsValue::Rational(n) => Value::Float(*n),
            JsValue::Integer(n) => Value::Number(*n),
            JsValue::BigInt(_) => todo!(),
            JsValue::Object(obj) => {
                if obj.is_array() {
                    let arr = JsArray::try_from_js(self, context).unwrap();
                    let len = arr.length(context).unwrap();
                    let mut v = Vec::new();

                    for i in 0..len {
                        let js = arr.at(i as i64, context).unwrap();

                        let s = match js {
                            JsValue::String(s) => s.to_std_string().unwrap(),
                            _ => {
                                todo!()
                            }
                        };
                        v.push(Value::String(s));
                    }
                    return Value::Array(v);
                }

                todo!()
            }
            JsValue::Symbol(_) => todo!(),
        }
    }
}

impl IntoJs for i32 {
    fn into_js(&self, _context: &mut Context) -> JsValue {
        boa_engine::JsValue::Integer(*self)
    }
}

impl IntoJs for () {
    fn into_js(&self, _context: &mut Context) -> JsValue {
        boa_engine::JsValue::Undefined
    }
}

impl IntoJs for f64 {
    fn into_js(&self, _context: &mut Context) -> JsValue {
        boa_engine::JsValue::Rational(*self)
    }
}
impl IntoJs for String {
    fn into_js(&self, _context: &mut Context) -> JsValue {
        boa_engine::JsValue::String(js_string!(self.as_str()))
    }
}
impl IntoJs for bool {
    fn into_js(&self, _context: &mut Context) -> JsValue {
        boa_engine::JsValue::Boolean(*self)
    }
}
impl IntoJs for Vec<String> {
    fn into_js(&self, context: &mut Context) -> JsValue {
        let arr = JsArray::new(context);

        for i in self.iter() {
            arr.push(JsValue::String(js_string!(i.as_str())), context)
                .unwrap();
        }
        arr.into()
    }
}
trait BoaFn<Args = (), Ret = ()> {
    fn eval(&self, args: &[JsValue], context: &mut Context) -> Ret;
    fn args(&self, args: &[JsValue], context: &mut Context) -> Args;
}

impl<A0, A1, R, F> BoaFn<(A0, A1), R> for F
where
    F: Fn(A0, A1) -> R,
    A0: From<Value>,
    A1: From<Value>,
    R: Into<Value>,
{
    fn eval(&self, args: &[JsValue], context: &mut Context) -> R {
        let args = self.args(args, context);
        self(args.0, args.1)
    }

    fn args(&self, args: &[JsValue], context: &mut Context) -> (A0, A1) {
        let a0 = args[0].from_js(context);
        let a0: A0 = a0.into();

        let a1 = args[1].from_js(context);
        let a1: A1 = a1.into();

        (a0, a1)
    }
}
impl<R, F> BoaFn<(), R> for F
where
    F: Fn() -> R,
    R: Into<Value>,
{
    fn eval(&self, _args: &[JsValue], _context: &mut Context) -> R {
        self()
    }

    fn args(&self, _args: &[JsValue], _context: &mut Context) {}
}

impl<A0, R, F> BoaFn<(A0,), R> for F
where
    F: Fn(A0) -> R,
    A0: From<Value>,
    R: Into<Value>,
{
    fn eval(&self, args: &[JsValue], context: &mut Context) -> R {
        let args = self.args(args, context);
        self(args.0)
    }

    fn args(&self, args: &[JsValue], context: &mut Context) -> (A0,) {
        let a0 = args[0].from_js(context);
        let a0: A0 = a0.into();

        (a0,)
    }
}
impl From<Value> for i32 {
    fn from(value: Value) -> Self {
        match value {
            Value::Number(b) => b,
            _ => {
                todo!()
            }
        }
    }
}
impl From<Value> for () {
    fn from(value: Value) -> Self {
        match value {
            Value::Undefined => (),
            _ => {
                todo!()
            }
        }
    }
}
impl From<Value> for bool {
    fn from(value: Value) -> Self {
        match value {
            Value::Bool(b) => b,
            _ => {
                todo!()
            }
        }
    }
}
impl From<Value> for f64 {
    fn from(value: Value) -> Self {
        match value {
            Value::Float(f) => f,
            _ => {
                todo!()
            }
        }
    }
}

impl From<Value> for String {
    fn from(value: Value) -> Self {
        match value {
            Value::String(s) => s,
            _ => {
                todo!()
            }
        }
    }
}

impl From<Value> for Vec<String> {
    fn from(value: Value) -> Self {
        match value {
            Value::Array(arr) => {
                let mut v = Vec::new();
                // let a:&String = &s[0].into();
                for i in arr {
                    match i {
                        Value::String(s) => v.push(s),
                        _ => {
                            todo!()
                        }
                    }
                }
                v
            }
            _ => {
                todo!()
            }
        }
    }
}
impl From<i32> for Value {
    fn from(val: i32) -> Self {
        Value::Number(val)
    }
}

impl From<f64> for Value {
    fn from(val: f64) -> Self {
        Value::Float(val)
    }
}

impl From<bool> for Value {
    fn from(val: bool) -> Self {
        Value::Bool(val)
    }
}

impl From<()> for Value {
    fn from(_val: ()) -> Self {
        Value::Undefined
    }
}
impl From<String> for Value {
    fn from(val: String) -> Self {
        Value::String(val)
    }
}

impl From<Vec<String>> for Value {
    fn from(val: Vec<String>) -> Self {
        let mut v = Vec::new();

        for i in val {
            v.push(Value::String(i));
        }
        Value::Array(v)
    }
}
pub fn new_context() -> Context {
    let mut context = Context::default();

    let mut op_list = vec![];
    macro_rules! add_op {
    ($(($id:ident, $name:ident, $boa:ident, $len:expr )) *) => {
     $(
      fn $boa (_: &JsValue, args: &[JsValue], context: &mut Context) -> JsResult<JsValue> {
        let r = $id.eval(args, context);
        let r: JsValue = r.into_js(context);
        Ok(r)
      }

      op_list.push(stringify!($name));
         context
            .register_global_property(js_string!( stringify!($name) ),
            FunctionObjectBuilder::new(context.realm(), NativeFunction::from_fn_ptr($boa))
                .name(stringify!($name))
                .length($len)
                .build(),
                Attribute::all())
            .unwrap();
     )*
    };
}

    add_op!((op_print, op_print, boa_op_print, 1)(
        op_commandv,
        op_commandv,
        boa_op_commandv,
        1
    )(
        op_get_property_string,
        op_get_property_string,
        boa_op_get_property_string,
        1
    )(
        op_command_string,
        op_command_string,
        boa_op_command_string,
        1
    )(
        op_set_property_bool,
        op_set_property_bool,
        boa_op_set_property_bool,
        2
    )(
        op_set_property_number,
        op_set_property_number,
        boa_op_set_property_number,
        2
    )(
        op_set_property_string,
        op_set_property_string,
        boa_op_set_property_string,
        2
    )(op_get_cwd, op_get_cwd, boa_op_get_cwd, 0)(
        op_read_file,
        op_read_file,
        boa_op_read_file,
        1
    )(op_write_file, op_write_file, boa_op_write_file, 2)(
        op_file_size,
        op_file_size,
        boa_op_file_size,
        1
    )(op_file_exists, op_file_exists, boa_op_file_exists, 1)(
        op_read_dir,
        op_read_dir,
        boa_op_read_dir,
        1
    )(op_is_file, op_is_file, boa_op_is_file, 1)(
        op_command_native,
        op_command_native,
        boa_op_command_native,
        2
    )(
        op_command_json, op_command_json, boa_op_command_json, 1
    )(
        op_command_native_async,
        op_command_native_async,
        boa_op_command_native_async,
        2
    ));

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
    context
        .eval(Source::from_bytes(&code.into_bytes()))
        .unwrap();
    context
}
