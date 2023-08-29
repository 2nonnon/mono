export interface ILevel { size: Coordinate; num: number }

export const Level: { [k: string]: ILevel } = {
  easy: { size: [9, 9], num: 10 },
  medieum: { size: [16, 16], num: 40 },
  hard: { size: [32, 16], num: 99 },
}

export enum GameState {
  PRE = 'prepare',
  GOING = 'going',
  PAUSE = 'pause',
  WIN = 'win',
  FAIL = 'fail',
}

export enum BlockType {
  BLOCK = 'block',
  MINE = 'mine',
}

export interface IBlock {
  content: number
  type: BlockType
  hidden: boolean
  flag: boolean
}

export type MineRow = IBlock[]

export type MineSweeperType = MineRow[]

export type Coordinate = [y:number, x:number]
