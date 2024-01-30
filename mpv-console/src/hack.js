const g = Function("return this")()
g.__hack_print_output = ""
g.__boa_no_color = () => false

const __old_console = g.console
g.console = new globalThis.console.Console((s) => __old_console.log(s))
