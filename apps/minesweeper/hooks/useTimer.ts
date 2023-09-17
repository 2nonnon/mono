import { useEffect, useState } from 'react'
import { cancelRaf, raf } from '@/utils/raf'
import type { CurrentTime } from '@/utils/time'
import { isSameSecond, parseTime } from '@/utils/time'

export interface UseTimerOptions {
  time: number
  millisecond?: boolean
  onChange?: (current: CurrentTime) => void
  onFinish?: () => void
}

export function useTimer(options: UseTimerOptions) {
  const [rafId, setRafId] = useState(-1)
  const [counting, setCounting] = useState(true)
  const [remain, setRemain] = useState(options.time)
  const endTime = Date.now() + remain
  const current = parseTime(remain)

  const getCurrentRemain = () => Math.max(endTime - Date.now(), 0)

  const changeRemain = (value: number) => {
    setRemain(value)
    options.onChange?.(current)

    if (value === 0) {
      setCounting(false)
      options.onFinish?.()
    }
  }

  const microTick = () => {
    setRafId(raf(() => {
      // in case of call reset immediately after finish
      if (counting) {
        changeRemain(getCurrentRemain())

        if (remain > 0)
          microTick()
      }
    }))
  }

  const macroTick = () => {
    setRafId(raf(() => {
      // in case of call reset immediately after finish
      if (counting) {
        const remainRemain = getCurrentRemain()

        if (!isSameSecond(remainRemain, remain) || remainRemain === 0)
          changeRemain(remainRemain)

        if (remain > 0)
          macroTick()
      }
    }))
  }

  const tick = () => {
    if (options.millisecond)
      microTick()
    else
      macroTick()
  }

  useEffect(() => {
    if (counting)
      tick()
    else
      cancelRaf(rafId)
    return () => {
      cancelRaf(rafId)
    }
  }, [counting])

  const pause = () => {
    setCounting(false)
  }

  const start = () => {
    if (!counting)
      setCounting(true)
  }

  const reset = (totalTime: number = options.time) => {
    setCounting(false)
    setRemain(totalTime)
  }

  return {
    start,
    pause,
    reset,
    current,
  }
}
