import { useEffect, useState } from 'react'
import throttle from '@/utils/throttle'

export function useClientSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    function callback() {
      setSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      })
    }

    const throttleCallback = throttle(callback)

    callback()

    window.addEventListener('resize', throttleCallback)
    return () => {
      window.removeEventListener('resize', throttleCallback)
    }
  }, [])

  return size
}
