import { HexToRGB } from './HexToRGB'

export const splitHexString = (hex: string) => {
  const length = hex.length

  let step = 1
  if (length === 4)
    step = 1
  else if (length === 7)
    step = 2

  let start = 1

  const R = hex.slice(start, (start += step))
  const G = hex.slice(start, (start += step))
  const B = hex.slice(start, (start += step))

  return { R, G, B }
}

const getPassValue = (pass: number) => {
  if (pass <= 0.04045)
    return pass / 12.92
  else
    return ((pass + 0.055) / 1.055) ** 2.4
}

const getRelativeLuminance = (R: number, G: number, B: number) => {
  return 0.2126 * getPassValue(R) + 0.7152 * getPassValue(G) + 0.0722 * getPassValue(B)
}

export const getContrast = (color1: string, color2: string) => {
  if (!color1.startsWith('#') || !color2.startsWith('#'))
    return

  const hex1 = splitHexString(color1)
  const rgb1 = HexToRGB(hex1.R, hex1.G, hex1.B)

  const L1 = getRelativeLuminance(rgb1.R / 255, rgb1.G / 255, rgb1.B / 255)

  const hex2 = splitHexString(color2)
  const rgb2 = HexToRGB(hex2.R, hex2.G, hex2.B)

  const L2 = getRelativeLuminance(rgb2.R / 255, rgb2.G / 255, rgb2.B / 255)

  return ((L1 + 0.05) / (L2 + 0.05)).toFixed(2)
}

