use super::format::Format;
use crate::bindgen::client::{
    mpv_format_MPV_FORMAT_DOUBLE, mpv_format_MPV_FORMAT_INT64, mpv_format_MPV_FORMAT_NODE_ARRAY,
    mpv_format_MPV_FORMAT_NODE_MAP, mpv_format_MPV_FORMAT_STRING, mpv_node,
};
use std::ffi::{c_void, CString};

pub unsafe fn mpv_node_to_json(node: *mut mpv_node) -> serde_json::Value {
    let node = *node;

    match node.format {
        mpv_format_MPV_FORMAT_STRING => {
            let s = CString::from_raw(node.u.string)
                .to_string_lossy()
                .to_string();
            let json = serde_json::Value::String(s);
            return json;
        }
        mpv_format_MPV_FORMAT_INT64 => {
            let n = node.u.int64 as i32;
            let json = serde_json::value::Number::from(n);
            return serde_json::Value::Number(json);
        }
        mpv_format_MPV_FORMAT_DOUBLE => {
            let n = node.u.double_ as f64;
            let json = serde_json::value::Number::from_f64(n).unwrap();
            return serde_json::Value::Number(json);
        }
        mpv_format_MPV_FORMAT_NODE_MAP => {
            let mut m = serde_json::value::Map::new();
            let list = *node.u.list;
            for i in 0..list.num {
                let child = list.values.offset(i as isize);
                let json = mpv_node_to_json(child);
                let key_ptr = list.keys.offset(i as isize) as *const c_void;
                let key = String::from_ptr(key_ptr).unwrap();
                m.insert(key, json);
            }

            let obj = serde_json::Value::Object(m);
            return obj;
        }
        mpv_format_MPV_FORMAT_NODE_ARRAY => {
            let mut v = vec![];
            let list = *node.u.list;
            for i in 0..list.num {
                let child = list.values.offset(i as isize);
                let json = mpv_node_to_json(child);
                v.push(json);
            }

            let obj = serde_json::Value::Array(v);
            return obj;
        }
        _ => return serde_json::Value::Null,
    }
}
