import type { FunctionComponent } from 'react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const Modal: FunctionComponent<{ children: any }> = ({ children }) => {
  const modalRoot = document.body
  const elRef = useRef<HTMLDivElement | null>(null)
  if (!elRef.current)
    elRef.current = document.createElement('div')

  useEffect(() => {
    modalRoot!.appendChild(elRef.current!)
    return () => {
      modalRoot!.removeChild(elRef.current!)
    }
  }, [])

  return createPortal(<div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>{children}</div>, elRef.current)
}

export default Modal
