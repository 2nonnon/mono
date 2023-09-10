import { useEffect, useState } from 'react'

function createGlobalState<T extends object = object>(initialState: T) {
  const state: T = initialState
  const subscribers = {} as { [K in keyof T]: any[] }

  for (const i in state)
    subscribers[i] = []

  function useGlobalState<K extends keyof T>(
    key: K,
  ): [T[K], (value: T[K]) => void] {
    if (!Object.hasOwnProperty.call(state, key))
      throw new Error('Key does not exist in the store')

    const [stateChunk, setStateChunk] = useState<T[K]>(
      state[key] as T[K],
    )

    useEffect(() => {
      subscribers[key].push(setStateChunk)

      return () => {
        const index = subscribers[key].findIndex(fn => fn === setStateChunk)
        subscribers[key].splice(index, 1)
      }
    }, [key])

    return [
      stateChunk,
      (value) => {
        setGlobalState(key, value)
      },
    ]
  }

  function setGlobalState<K extends keyof T>(key: K, value: T[K]) {
    if (!Object.hasOwnProperty.call(state, key))
      throw new Error('Key does not exist in the store')

    state[key] = value

    subscribers[key].forEach((subscriber) => {
      subscriber(value)
    })
  }

  function getGlobalState(key: keyof T) {
    if (!Object.hasOwnProperty.call(state, key))
      throw new Error('Key does not exist in the store')

    return state[key]
  }

  return {
    useGlobalState,
    setGlobalState,
    getGlobalState,
  }
}

export default createGlobalState
