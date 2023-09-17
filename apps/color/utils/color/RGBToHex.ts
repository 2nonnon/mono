export function RGBToHex(R: number, G: number, B: number) {
  const rgb = { R: R.toString(16), G: G.toString(16), B: B.toString(16) }

  Object.keys(rgb).forEach((key) => {
    rgb[key].length === 1 && (rgb[key] = `0${rgb[key]}`)
  })

  return rgb
}
