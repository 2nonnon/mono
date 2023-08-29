import type { Coordinate, MineSweeperType } from './type'
import { BlockType } from './type'

export const generateMine = ([row, col]: [number, number], num: number, start: Coordinate) => {
  if (row <= 3 || col <= 3 || num <= 0)
    return []

  const hashList = new Set<number>()

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const y = start[0] + i
      const x = start[1] + j
      if (x >= 0 && y >= 0)
        hashList.add(y * col + x)
    }
  }

  const size = row * col

  const max = size - hashList.size

  const length = num > max ? max : num

  return Array.from({ length }).map(() => {
    let x = Math.floor(Math.random() * col)
    let y = Math.floor(Math.random() * row)
    const init = y * col + x
    let hash = init
    while (hashList.has(hash)) {
      hash += 1
      if (hash >= size)
        hash = 0
    }
    hashList.add(hash)
    if (hash !== init) {
      y = Math.floor(hash / row)
      x = hash % row
    }

    return [y, x] as Coordinate
  })
}

export const initMineSweeper = (mineSweeper: MineSweeperType, mines: Coordinate[]) => {
  const res = mineSweeper.map(mineRow => mineRow.map(mine => ({ ...mine })))
  mines.forEach(([y, x]) => {
    if (!res[y]?.[x])
      return

    res[y][x].type = BlockType.MINE

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++)
        res[y + i]?.[x + j] && (res[y + i][x + j].content += 1)
    }
  })

  return res
}

export const handleClickMine = (mineSweeper: MineSweeperType, [y, x]: Coordinate) => {
  if (!mineSweeper[y][x] || mineSweeper[y][x].type !== BlockType.MINE)
    return mineSweeper
  const res = mineSweeper.map(mineRow => mineRow.map(mine => ({ ...mine })))
  res[y][x].hidden = false

  return res
}

export const handleClickBlock = (mineSweeper: MineSweeperType, [y, x]: Coordinate) => {
  if (!mineSweeper[y][x] || mineSweeper[y][x].type !== BlockType.BLOCK)
    return mineSweeper
  const res = mineSweeper.map(mineRow => mineRow.map(mine => ({ ...mine })))
  if (res[y][x].content > 0) {
    res[y][x].hidden = false
  }
  else {
    const queue = [] as Coordinate[]
    res[y][x].hidden = false
    res[y]?.[x + 1] && queue.push([y, x + 1])
    res[y]?.[x - 1] && queue.push([y, x - 1])
    res[y + 1]?.[x] && queue.push([y + 1, x])
    res[y - 1]?.[x] && queue.push([y - 1, x])

    while (queue.length > 0) {
      const [y, x] = queue.shift()!
      if (!res[y][x].hidden || res[y][x].type === BlockType.MINE || res[y][x].flag) {
        continue
      }
      else if (res[y][x].content > 0) {
        res[y][x].hidden = false
        continue
      }
      else {
        res[y][x].hidden = false
        res[y]?.[x + 1] && queue.push([y, x + 1])
        res[y]?.[x - 1] && queue.push([y, x - 1])
        res[y + 1]?.[x] && queue.push([y + 1, x])
        res[y - 1]?.[x] && queue.push([y - 1, x])
      }
    }
  }

  return res
}

export const handleToggleFlag = (mineSweeper: MineSweeperType, [y, x]: Coordinate) => {
  const res = mineSweeper.map(mineRow => mineRow.map(mine => ({ ...mine })))
  res[y][x].flag = !res[y][x].flag

  return res
}

export const checkWin = (mineSweeper: MineSweeperType) => {
  return mineSweeper.every(row => row.every((mine) => {
    if (mine.type === BlockType.MINE)
      return mine.flag

    else return true
  }))
}
