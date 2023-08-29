'use client'

import type { Dispatch } from 'react'
import { createContext, useContext, useReducer } from 'react'
import type { QrcodeProps } from '@/components/Qrcode'

const QrcodeContext = createContext<QrcodeProps | null>(null)

const QrcodeDispatchContext = createContext<Dispatch<QrcodeReducerAction> | null>(null)

interface QrcodeProviderProps {
  children: React.ReactNode
}

export function QrcodeProvider({ children }: QrcodeProviderProps) {
  const [qrcode, dispatch] = useReducer(
    qrcodeReducer,
    {
      typeNumber: 0,
      errorCorrectionLevel: 'L',
      mode: 'Byte',
      content: 'Hi!',
      multibyte: 'UTF-8',
      margin: 10,
      pixelSize: 20,
      pixelStyle: 'Rounded',
      markerStyle: 'Auto',
    } as QrcodeProps,
  )

  return (
    <QrcodeContext.Provider value={qrcode}>
      <QrcodeDispatchContext.Provider value={dispatch}>
        {children}
      </QrcodeDispatchContext.Provider>
    </QrcodeContext.Provider>
  )
}

export function useQrcodeOptions() {
  return useContext(QrcodeContext)!
}

export function useQrcodeDispatch() {
  return useContext(QrcodeDispatchContext)!
}

export interface QrcodeReducerAction {
  type: 'changed'
  options: Partial<QrcodeProps>
}

function qrcodeReducer(options: QrcodeProps, action: QrcodeReducerAction): QrcodeProps {
  switch (action.type) {
    case 'changed': {
      return Object.assign({}, options, action.options)
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}
