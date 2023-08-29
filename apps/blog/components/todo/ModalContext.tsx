import type { Dispatch } from 'react'
import { createContext, useContext, useReducer } from 'react'
import type { ITask } from './TasksContext'

export interface ModalData {
  show: boolean
  task?: ITask
}

const ModalContext = createContext<ModalData | null>(null)

const ModalDispatchContext = createContext<Dispatch<ModalReducerAction> | null>(null)

interface ModalProviderProps {
  children: React.ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [data, dispatch] = useReducer(
    ModalReducer,
    {
      show: false,
    },
  )

  return (
    <ModalContext.Provider value={data}>
      <ModalDispatchContext.Provider value={dispatch}>
        {children}
      </ModalDispatchContext.Provider>
    </ModalContext.Provider>
  )
}

export function useModal() {
  return useContext(ModalContext)
}

export function useModalDispatch() {
  return useContext(ModalDispatchContext)
}

export type ModalReducerAction = {
  type: 'add'
} | {
  type: 'change'
  task: ITask
} | {
  type: 'close'
}

function ModalReducer(data: ModalData, action: ModalReducerAction): ModalData {
  switch (action.type) {
    case 'add': {
      return {
        show: true,
      }
    }
    case 'change': {
      return {
        show: true,
        task: action.task,
      }
    }
    case 'close': {
      return {
        show: false,
      }
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}
