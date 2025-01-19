// @ts-nocheck

const g = Function("return this")()
g.mp = mp
const log = g.print
function mockFn(obj: any, list: string[]) {
  for (const name of list) {
    obj[name] = (...args: any[]) => {
      log(name, args.join(", "))
    }
  }
}
const fnList: string[] = [
  "_abort_async_command",
  "_command_native_async",
  "_hook_add",
  "_hook_continue",
  "_observe_property",
  "_request_event",
  "_set_last_error",
  "_unobserve_property",
  "abort_async_command",
  "add_forced_key_binding",
  "add_hook",
  "add_key_binding",
  "command",
  "command_native",
  "command_native_async",
  "commandv",
  "create_osd_overlay",
  "del_property",
  "dispatch_event",
  "enable_messages",
  "find_config_file",
  "flush_key_bindings",
  "format_time",
  "get_mouse_pos",
  "get_opt",
  "get_osd_margins",
  "get_osd_size",
  "get_property",
  "get_property_bool",
  "get_property_native",
  "get_property_number",
  "get_property_osd",
  "get_script_directory",
  "get_script_file",
  "get_script_name",
  "get_time",
  "get_time_ms",
  "get_wakeup_pipe",
  "input_set_section_mouse_area",
  "keep_running",
  "last_error",
  "log",
  "module_paths",
  "msg",
  "notify_idle_observers",
  "observe_property",
  "options",
  "osd_message",
  "peek_timers_wait",
  "process_timers",
  "register_event",
  "register_idle",
  "register_script_message",
  "remove_key_binding",
  "script_file",
  "script_name",
  "set_osd_ass",
  "set_property",
  "set_property_bool",
  "set_property_native",
  "set_property_number",
  "unobserve_property",
  "unregister_event",
  "unregister_idle",
  "unregister_script_message",
  "utils",
  "wait_event",
]
const uFnList: string[] = ["read_options"]
const oFnList: string[] = [
  "_gc",
  "_write_file",
  "append_file",
  "compile_js",
  "file_info",
  "get_env_list",
  "get_user_path",
  "getcwd",
  "getenv",
  "getpid",
  "join_path",
  "read_file",
  "readdir",
  "split_path",
  "subprocess",
  "subprocess_detached",
  "write_file",
]

const utils: any = {}
const options: any = {}
mp.utils = utils
mp.options = options

mockFn(mp, fnList)
mockFn(utils, uFnList)
mockFn(options, oFnList)
