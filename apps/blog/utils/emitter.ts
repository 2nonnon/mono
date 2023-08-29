export type TaskEvent = string
interface Fn<T = any, R = T> {
  (...arg: T[]): R
}

export class PubSub {
  private eventMap = new Map<TaskEvent, Fn[]>()

  subscribe(event: TaskEvent, callback: Fn) {
    if (this.eventMap.has(event))
      this.eventMap.get(event)?.push(callback)
    else this.eventMap.set(event, [callback])
  }

  unsubscribe(event: TaskEvent, callback: Fn) {
    const cbQueue = this.eventMap.get(event)
    const index = cbQueue?.findIndex(cb => cb === callback)
    if (typeof index === 'number')
      cbQueue?.splice(index, 1)
  }

  once(event: TaskEvent, callback: Fn) {
    const fn = (...args: any[]) => {
      callback(...args)
      this.unsubscribe(event, fn)
    }

    this.eventMap.get(event)?.push(fn)
  }

  emit(event: TaskEvent, ...args: any[]) {
    this.eventMap.get(event)?.forEach(callback => callback(...args))
  }
}
