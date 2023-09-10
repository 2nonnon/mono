export function HexToRGB(R: string, G: string, B: string) {
  const _R = R.length === 1 ? R + R : R
  const _G = G.length === 1 ? G + G : G
  const _B = B.length === 1 ? B + B : B
  return { R: Number.parseInt(_R, 16), G: Number.parseInt(_G, 16), B: Number.parseInt(_B, 16) }
}
