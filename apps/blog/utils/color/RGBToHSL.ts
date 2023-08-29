export const RGBToHSL = (R: number, G: number, B: number) => {
  const _R = R / 255
  const _G = G / 255
  const _B = B / 255

  const cMax = Math.max(_R, _G, _B)
  const cMin = Math.min(_R, _G, _B)
  const delta = cMax - cMin

  let H = 0
  let S = 0
  const L = (cMax + cMin) / 2

  if (delta !== 0) {
    switch (cMax) {
      case _R: H = 60 * (((_G - _B) / delta) % 6)
        break
      case _G: H = 60 * (((_B - _R) / delta) + 2)
        break
      case _B: H = 60 * (((_R - _G) / delta) + 4)
    }

    S = delta / (1 - Math.abs(2 * L - 1))
  }

  return { H: (Math.round(H) + 360) % 360, S: Math.round(S * 100), L: Math.round(L * 100) }
}
