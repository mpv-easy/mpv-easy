pub use crate::bindgen::client::{
    mpv_format_MPV_FORMAT_DOUBLE, mpv_format_MPV_FORMAT_FLAG, mpv_format_MPV_FORMAT_INT64,
    mpv_format_MPV_FORMAT_STRING,
};
use crate::client_dyn::ffi::mpv_handle;
use crate::client_dyn::format::Format;
use crate::client_dyn::lib::{Event, Handle};

static mut GLOBAL_MP_HANDLE: Option<&mut Handle> = None;

pub fn init_mp_api(handle: *mut mpv_handle) {
    unsafe { GLOBAL_MP_HANDLE = Some(Handle::from_ptr(handle)) };
}

pub fn commandv<I: IntoIterator<Item = S>, S: AsRef<str>>(cmd: I) {
    unsafe {
        let h = GLOBAL_MP_HANDLE.as_deref_mut().unwrap();
        h.commandv(cmd).unwrap();
    }
}

pub fn command_string<S: AsRef<str>>(cmd: S) {
    unsafe {
        let h = GLOBAL_MP_HANDLE.as_deref_mut().unwrap();
        h.command_string(cmd).unwrap();
    }
}

pub fn command_json<I: IntoIterator<Item = S>, S: AsRef<str>>(cmd: I) -> serde_json::Value {
    unsafe {
        let h = GLOBAL_MP_HANDLE.as_deref_mut().unwrap();
        h.command_json(cmd).unwrap()
    }
}

pub fn wait_event(timeout: f64) -> Event {
    unsafe {
        let e = GLOBAL_MP_HANDLE.as_deref_mut().unwrap().wait_event(timeout);
        e
    }
}

pub fn get_property<T: Format, S: AsRef<str>>(name: S) -> T {
    unsafe {
        let p = GLOBAL_MP_HANDLE
            .as_deref_mut()
            .unwrap()
            .get_property::<T, S>(name)
            .unwrap();
        p
    }
}

pub fn get_property_string<S: AsRef<str>>(name: S) -> String {
    unsafe {
        let p = GLOBAL_MP_HANDLE
            .as_deref_mut()
            .unwrap()
            .get_property::<String, S>(name)
            .unwrap_or_default();
        p
    }
}

pub fn observe_property<S: AsRef<str>>(reply: u64, name: S, format: u32) {
    unsafe {
        GLOBAL_MP_HANDLE
            .as_deref_mut()
            .unwrap()
            // TODO: format enum
            .observe_property(reply, name, format as i32)
            .unwrap();
        
    }
}

pub fn request_event(event_id: u32, enable: bool) {
    unsafe {
        GLOBAL_MP_HANDLE
            .as_deref_mut()
            .unwrap()
            // TODO: format enum
            .request_event(event_id, enable)
            .unwrap();
        
    }
}

pub fn set_property_number(name: String, v: f64) {
    unsafe {
        GLOBAL_MP_HANDLE
            .as_deref_mut()
            .unwrap()
            // TODO: format enum
            .set_property(name, v)
            .unwrap();
        
    }
}

pub fn set_property_string(name: String, v: String) {
    unsafe {
        GLOBAL_MP_HANDLE
            .as_deref_mut()
            .unwrap()
            // TODO: format enum
            .set_property(name, v)
            .unwrap();
        
    }
}

pub fn set_property_bool(name: String, v: bool) {
    unsafe {
        GLOBAL_MP_HANDLE
            .as_deref_mut()
            .unwrap()
            // TODO: format enum
            .set_property(name, v)
            .unwrap();
        
    }
}