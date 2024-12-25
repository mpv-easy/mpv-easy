import adaptive_sharpen from "../shaders/adaptive_sharpen.glsl"
import adaptive_sharpen_luma from "../shaders/adaptive_sharpen_luma.glsl"
import AMD_FSR from "../shaders/AMD_FSR.glsl"
import AMD_FSR_EASU_luma from "../shaders/AMD_FSR_EASU_luma.glsl"
import AMD_FSR_EASU_rgb from "../shaders/AMD_FSR_EASU_rgb.glsl"
import AMD_FSR_rgb from "../shaders/AMD_FSR_rgb.glsl"
import Anime4K_AutoDownscalePre_x2 from "../shaders/Anime4K_AutoDownscalePre_x2.glsl"
import Anime4K_AutoDownscalePre_x4 from "../shaders/Anime4K_AutoDownscalePre_x4.glsl"
import Anime4K_Clamp_Highlights from "../shaders/Anime4K_Clamp_Highlights.glsl"
import Anime4K_Darken_Fast from "../shaders/Anime4K_Darken_Fast.glsl"
import Anime4K_Darken_HQ from "../shaders/Anime4K_Darken_HQ.glsl"
import Anime4K_Darken_VeryFast from "../shaders/Anime4K_Darken_VeryFast.glsl"
import Anime4K_Deblur_DoG from "../shaders/Anime4K_Deblur_DoG.glsl"
import Anime4K_Deblur_Original from "../shaders/Anime4K_Deblur_Original.glsl"
import Anime4K_Denoise_Bilateral_Mean from "../shaders/Anime4K_Denoise_Bilateral_Mean.glsl"
import Anime4K_Denoise_Bilateral_Median from "../shaders/Anime4K_Denoise_Bilateral_Median.glsl"
import Anime4K_Denoise_Bilateral_Mode from "../shaders/Anime4K_Denoise_Bilateral_Mode.glsl"
import Anime4K_Restore_CNN_L from "../shaders/Anime4K_Restore_CNN_L.glsl"
import Anime4K_Restore_CNN_M from "../shaders/Anime4K_Restore_CNN_M.glsl"
import Anime4K_Restore_CNN_S from "../shaders/Anime4K_Restore_CNN_S.glsl"
import Anime4K_Restore_CNN_Soft_L from "../shaders/Anime4K_Restore_CNN_Soft_L.glsl"
import Anime4K_Restore_CNN_Soft_M from "../shaders/Anime4K_Restore_CNN_Soft_M.glsl"
import Anime4K_Restore_CNN_Soft_S from "../shaders/Anime4K_Restore_CNN_Soft_S.glsl"
import Anime4K_Restore_CNN_Soft_UL from "../shaders/Anime4K_Restore_CNN_Soft_UL.glsl"
import Anime4K_Restore_CNN_Soft_VL from "../shaders/Anime4K_Restore_CNN_Soft_VL.glsl"
import Anime4K_Restore_CNN_UL from "../shaders/Anime4K_Restore_CNN_UL.glsl"
import Anime4K_Restore_CNN_VL from "../shaders/Anime4K_Restore_CNN_VL.glsl"
import Anime4K_Restore_GAN_UL from "../shaders/Anime4K_Restore_GAN_UL.glsl"
import Anime4K_Thin_Fast from "../shaders/Anime4K_Thin_Fast.glsl"
import Anime4K_Thin_HQ from "../shaders/Anime4K_Thin_HQ.glsl"
import Anime4K_Thin_VeryFast from "../shaders/Anime4K_Thin_VeryFast.glsl"
import Anime4K_Upscale_CNN_x2_L from "../shaders/Anime4K_Upscale_CNN_x2_L.glsl"
import Anime4K_Upscale_CNN_x2_M from "../shaders/Anime4K_Upscale_CNN_x2_M.glsl"
import Anime4K_Upscale_CNN_x2_S from "../shaders/Anime4K_Upscale_CNN_x2_S.glsl"
import Anime4K_Upscale_CNN_x2_UL from "../shaders/Anime4K_Upscale_CNN_x2_UL.glsl"
import Anime4K_Upscale_CNN_x2_VL from "../shaders/Anime4K_Upscale_CNN_x2_VL.glsl"
import Anime4K_Upscale_Deblur_DoG_x2 from "../shaders/Anime4K_Upscale_Deblur_DoG_x2.glsl"
import Anime4K_Upscale_Deblur_Original_x2 from "../shaders/Anime4K_Upscale_Deblur_Original_x2.glsl"
import Anime4K_Upscale_Denoise_CNN_x2_L from "../shaders/Anime4K_Upscale_Denoise_CNN_x2_L.glsl"
import Anime4K_Upscale_Denoise_CNN_x2_M from "../shaders/Anime4K_Upscale_Denoise_CNN_x2_M.glsl"
import Anime4K_Upscale_Denoise_CNN_x2_S from "../shaders/Anime4K_Upscale_Denoise_CNN_x2_S.glsl"
import Anime4K_Upscale_Denoise_CNN_x2_UL from "../shaders/Anime4K_Upscale_Denoise_CNN_x2_UL.glsl"
import Anime4K_Upscale_Denoise_CNN_x2_VL from "../shaders/Anime4K_Upscale_Denoise_CNN_x2_VL.glsl"
import Anime4K_Upscale_DoG_x2 from "../shaders/Anime4K_Upscale_DoG_x2.glsl"
import Anime4K_Upscale_DTD_x2 from "../shaders/Anime4K_Upscale_DTD_x2.glsl"
import Anime4K_Upscale_GAN_x2_M from "../shaders/Anime4K_Upscale_GAN_x2_M.glsl"
import Anime4K_Upscale_Original_x2 from "../shaders/Anime4K_Upscale_Original_x2.glsl"
import FSRCNNX_x2_16_0_4_1 from "../shaders/FSRCNNX_x2_16_0_4_1.glsl"
import FSRCNNX_x2_8_0_4_1 from "../shaders/FSRCNNX_x2_8_0_4_1.glsl"
import hdeband from "../shaders/hdeband.glsl"
import KrigBilateral from "../shaders/KrigBilateral.glsl"
import nlmeans_dx from "../shaders/nlmeans_dx.glsl"
import nnedi3_nns128_win8x4 from "../shaders/nnedi3_nns128_win8x4.glsl"
import nnedi3_nns128_win8x6 from "../shaders/nnedi3_nns128_win8x6.glsl"
import SSimDownscaler from "../shaders/SSimDownscaler.glsl"

export const Shaders = {
  adaptive_sharpen,
  adaptive_sharpen_luma,
  AMD_FSR,
  AMD_FSR_EASU_luma,
  AMD_FSR_EASU_rgb,
  AMD_FSR_rgb,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Clamp_Highlights,
  Anime4K_Darken_Fast,
  Anime4K_Darken_HQ,
  Anime4K_Darken_VeryFast,
  Anime4K_Deblur_DoG,
  Anime4K_Deblur_Original,
  Anime4K_Denoise_Bilateral_Mean,
  Anime4K_Denoise_Bilateral_Median,
  Anime4K_Denoise_Bilateral_Mode,
  Anime4K_Restore_CNN_L,
  Anime4K_Restore_CNN_M,
  Anime4K_Restore_CNN_S,
  Anime4K_Restore_CNN_Soft_L,
  Anime4K_Restore_CNN_Soft_M,
  Anime4K_Restore_CNN_Soft_S,
  Anime4K_Restore_CNN_Soft_UL,
  Anime4K_Restore_CNN_Soft_VL,
  Anime4K_Restore_CNN_UL,
  Anime4K_Restore_CNN_VL,
  Anime4K_Restore_GAN_UL,
  Anime4K_Thin_Fast,
  Anime4K_Thin_HQ,
  Anime4K_Thin_VeryFast,
  Anime4K_Upscale_CNN_x2_L,
  Anime4K_Upscale_CNN_x2_M,
  Anime4K_Upscale_CNN_x2_S,
  Anime4K_Upscale_CNN_x2_UL,
  Anime4K_Upscale_CNN_x2_VL,
  Anime4K_Upscale_Deblur_DoG_x2,
  Anime4K_Upscale_Deblur_Original_x2,
  Anime4K_Upscale_Denoise_CNN_x2_L,
  Anime4K_Upscale_Denoise_CNN_x2_M,
  Anime4K_Upscale_Denoise_CNN_x2_S,
  Anime4K_Upscale_Denoise_CNN_x2_UL,
  Anime4K_Upscale_Denoise_CNN_x2_VL,
  Anime4K_Upscale_DoG_x2,
  Anime4K_Upscale_DTD_x2,
  Anime4K_Upscale_GAN_x2_M,
  Anime4K_Upscale_Original_x2,
  FSRCNNX_x2_16_0_4_1,
  FSRCNNX_x2_8_0_4_1,
  hdeband,
  KrigBilateral,
  nlmeans_dx,
  nnedi3_nns128_win8x4,
  nnedi3_nns128_win8x6,
  SSimDownscaler,
}
