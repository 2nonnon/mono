interface Fn<T = any, R = T> {
  (...arg: T[]): R
}

export const memorized = <T = any, R = T>(fn: Fn<T, R>) => {
  let cache: R | null = null

  const memorizedFn = (...args: T[]) => {
    if (cache)
      return cache
    else return (cache = fn(...args))
  }

  const clearCache = () => (cache = null)

  return [memorizedFn, clearCache] as const
}
