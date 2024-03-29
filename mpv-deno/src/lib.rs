use mpv_easy_client::api::init_mp_api;

use mpv_easy_client::client_dyn::ffi::mpv_handle;

use crate::run::run_mp_scripts;
mod ops;
mod run;

#[no_mangle]
unsafe extern "C" fn mpv_open_cplugin(handle: *mut mpv_handle) -> std::os::raw::c_int {
    init_mp_api(handle);
    run_mp_scripts();
    0
}
