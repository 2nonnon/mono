import { useEffect, useState } from 'react'
import type { IBlock, ILevel, MineSweeperType } from './type'
import { BlockType, GameState } from './type'

const block: IBlock = {
  content: 0,
  type: BlockType.BLOCK,
  hidden: true,
  flag: false,
}

interface mineSweeperOption {
  level: ILevel
  state: GameState
}

const useMineSweeper = ({ level, state }: mineSweeperOption) => {
  const [gameLevel, setGameLevel] = useState(level)
  const [row, col] = gameLevel.size
  const init = Array.from({ length: row }).map(_ => Array.from({ length: col }).map(_ => ({ ...block })))
  const [gameState, setGameState] = useState(state)
  const [mineSweeper, setMineSweeper] = useState<MineSweeperType>(init)
  const [flagCount, setFlagCount] = useState(0)

  useEffect(() => {
    if (gameState !== GameState.PRE)
      return
    const [row, col] = gameLevel.size
    const init = Array.from({ length: row }).map(_ => Array.from({ length: col }).map(_ => ({ ...block })))
    setMineSweeper(init)
    setFlagCount(0)
  }, [gameLevel, gameState])

  return { gameState, setGameState, mineSweeper, setMineSweeper, flagCount, setFlagCount, gameLevel, setGameLevel }
}

export default useMineSweeper
