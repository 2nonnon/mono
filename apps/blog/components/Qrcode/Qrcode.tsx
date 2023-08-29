'use client'

import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react'
import type { QrcodeProps } from './generateQrcode'
import { generateQrcode } from './generateQrcode'

const Qrcode = memo(forwardRef<HTMLCanvasElement>((options: QrcodeProps, ref) => {
  const target = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (target.current)
      generateQrcode(target.current, options)
  }, [options])

  useImperativeHandle(ref, () => {
    return target.current!
  }, [])

  return (
    <>
      <div className='relative before:block before:pb-[100%] min-w-[200px] max-w-xs w-full rounded flex border border-[var(--border-color)]'>
        <canvas ref={target} className="absolute inset-0 w-full h-full rounded"></canvas>
      </div>
    </>
  )
}))

export default Qrcode
