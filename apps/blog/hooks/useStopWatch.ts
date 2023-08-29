import { useEffect, useState } from 'react'
import { cancelRaf, raf } from '@/utils/raf'
import type { CurrentTime } from '@/utils/time'
import { isSameSecond, parseTime } from '@/utils/time'

export interface UseStopWatchOptions {
  millisecond?: boolean
  onChange?: (current: CurrentTime) => void
}

export function useStopWatch(options: UseStopWatchOptions = {}) {
  const [rafId, setRafId] = useState(-1)
  const [counting, setCounting] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startTime = Date.now() - elapsed
  const current = parseTime(elapsed)

  const getCurrentElapsed = () => Date.now() - startTime

  const changeElapsed = (value: number) => {
    setElapsed(value)
    options.onChange?.(current)
  }

  const microTick = () => {
    setRafId(raf(() => {
      // in case of call reset immediately after finish
      if (counting) {
        changeElapsed(getCurrentElapsed())

        microTick()
      }
    }))
  }

  const macroTick = () => {
    setRafId(raf(() => {
      // in case of call reset immediately after finish
      if (counting) {
        const currentElapsed = getCurrentElapsed()

        if (!isSameSecond(currentElapsed, elapsed) || currentElapsed === 0)
          changeElapsed(currentElapsed)

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

  const reset = () => {
    setCounting(false)
    setElapsed(0)
  }

  return {
    start,
    pause,
    reset,
    current,
  }
}
