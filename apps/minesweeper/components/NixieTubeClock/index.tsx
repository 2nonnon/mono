import style from './index.module.css'
import type { CurrentTime } from '@/utils/time'

interface NixieTubeProps {
  active?: boolean
  position?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
}

function NixieTube({ active, position }: NixieTubeProps) {
  return <div className={`${style.nixie} ${position ? style[`nixie--${position}`] : ''} ${active ? style['nixie--active'] : ''}`}></div>
}

const numMap = {
  0: [1, 1, 1, 0, 1, 1, 1],
  1: [0, 0, 1, 0, 0, 0, 1],
  2: [0, 1, 1, 1, 1, 1, 0],
  3: [0, 1, 1, 1, 0, 1, 1],
  4: [1, 0, 1, 1, 0, 0, 1],
  5: [1, 1, 0, 1, 0, 1, 1],
  6: [1, 1, 0, 1, 1, 1, 1],
  7: [0, 1, 1, 0, 0, 0, 1],
  8: [1, 1, 1, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1],
} as const

const positions = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const

interface NixieTubeNumProps { num?: keyof typeof numMap }

function NixieTubeNum({ num }: NixieTubeNumProps) {
  return <>
    <div className={style['nixie-num']}>
      {numMap[num!].map((v: 0 | 1, i: number) => {
        return <NixieTube key={i} active={!!v} position={positions[i]}></NixieTube>
      })}
    </div>
  </>
}

function Colon() {
  return <div className={style.colon}></div>
}

interface NixieTubeClockProps {
  current: CurrentTime
}

export default function NixieTubeClock({ current }: NixieTubeClockProps) {
  return (<>
    <div className='flex gap-[1.5em] -skew-x-3 p-[0.25em]'>
      <NixieTubeNum num={Math.floor(current.hours / 10) as keyof typeof numMap}></NixieTubeNum>
      <NixieTubeNum num={current.hours % 10 as keyof typeof numMap}></NixieTubeNum>
      <Colon></Colon>
      <NixieTubeNum num={Math.floor(current.minutes / 10) as keyof typeof numMap}></NixieTubeNum>
      <NixieTubeNum num={current.minutes % 10 as keyof typeof numMap}></NixieTubeNum>
      <Colon></Colon>
      <NixieTubeNum num={Math.floor(current.seconds / 10) as keyof typeof numMap}></NixieTubeNum>
      <NixieTubeNum num={current.seconds % 10 as keyof typeof numMap}></NixieTubeNum>
    </div>
  </>)
}
