export const HSVToRGB = (H: number, S: number, V: number) => {
  const C = V * S
  const X = C * (1 - Math.abs((H / 60) % 2 - 1))
  const m = V - C

  let _R = 0
  let _G = 0
  let _B = 0

  if (H >= 300)
    ([_R, _G, _B] = [C, 0, X])
  else if (H >= 240)
    ([_R, _G, _B] = [X, 0, C])
  else if (H >= 180)
    ([_R, _G, _B] = [0, X, C])
  else if (H >= 120)
    ([_R, _G, _B] = [0, C, X])
  else if (H >= 60)
    ([_R, _G, _B] = [X, C, 0])
  else
    ([_R, _G, _B] = [C, X, 0])

  const [R, G, B] = [Math.round((_R + m) * 255), Math.round((_G + m) * 255), Math.round((_B + m) * 255)]

  return { R, G, B }
}
