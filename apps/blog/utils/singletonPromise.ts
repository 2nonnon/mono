type ArgsType<T> = T extends (...args: infer R) => any ? R : any

export function singletonPromise<T extends (...args: any[]) => Promise<any>>(promiseFn: T) {
  let pending: ReturnType<T> | null = null

  return (...args: ArgsType<T>) => {
    if (!pending)
      pending = promiseFn(...args) as ReturnType<T>
    return new Promise((resolve, reject) => {
      pending!
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
        .finally(() => {
          pending = null
        })
    }) as ReturnType<T>
  }
}
