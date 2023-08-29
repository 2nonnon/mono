import type { Dispatch } from 'react'
import { createContext, useContext, useReducer } from 'react'

export interface ITask {
  id: number
  date: number
  content: string
  done: boolean
  deleted: boolean
}

const TasksContext = createContext<ITask[] | null>(null)

const TasksDispatchContext = createContext<Dispatch<TasksReducerAction> | null>(null)

interface TasksProviderProps {
  children: React.ReactNode
  initTasks?: ITask[]
}

export function TasksProvider({ children, initTasks = [] }: TasksProviderProps) {
  const [tasks, dispatch] = useReducer(
    tasksReducer,
    initTasks,
  )

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  )
}

export function useTasks() {
  return useContext(TasksContext)
}

export function useTasksDispatch() {
  return useContext(TasksDispatchContext)
}

export type TasksReducerAction = {
  type: 'added'
  content: ITask['content']
} | {
  type: 'changed'
  task: {
    id: ITask['id']
    content?: ITask['content']
    done?: ITask['done']
    deleted?: ITask['deleted']
  }
} | {
  type: 'deleted'
  id: ITask['id']
}

function tasksReducer(tasks: ITask[], action: TasksReducerAction): ITask[] {
  switch (action.type) {
    case 'added': {
      return [...tasks, {
        id: Date.now(),
        date: Date.now(),
        content: action.content,
        done: false,
        deleted: false,
      }]
    }
    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id)
          return Object.assign(t, action.task, { date: Date.now() })

        else
          return t
      })
    }
    case 'deleted': {
      return tasks.filter(t => t.id !== action.id)
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}
