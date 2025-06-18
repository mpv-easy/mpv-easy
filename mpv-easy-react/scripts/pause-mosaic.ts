const GLSL_PATH = "~~/shaders/pause-mosaic.glsl"

mp.observe_property("pause", "bool", (_, v) => {
  if (v) {
    mp.command(`change-list glsl-shaders add ${GLSL_PATH}`)
  } else {
    mp.command(`change-list glsl-shaders remove ${GLSL_PATH}`)
  }
})
