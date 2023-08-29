interface PromiseFn<T = any, R = T> {
  (...arg: T[]): Promise<R>
}

export type Task = PromiseFn
export type Queue = Task[]

// const events = ['fulfilled', 'rejected', 'retry', 'done'] as const;
// export type TaskEvent = typeof events[number];

export type stateType = 'prepare' | 'running' | 'preRetry' | 'retrying' | 'done'

export class Scheduler {
  public state: stateType = 'prepare'
  public runningTask = 0
  public taskCount = 0
  public fulfilledCount = 0
  private queue: Queue = []
  private maxConcurrent = 2
  private retryCount = 0
  private retryBack = 0
  private retryQueue: Queue = []
  private timeout = 1000

  constructor({
    queue = [],
    maxConcurrent = 2,
    retryCount = 0,
    timeout = 1000,
  }: {
    queue?: Queue
    maxConcurrent?: number
    retryCount?: number
    timeout?: number
  }) {
    this.queue = queue
    this.taskCount = queue.length
    this.maxConcurrent = maxConcurrent
    this.retryCount = retryCount
    this.retryBack = retryCount
    this.timeout = timeout > 1000 ? timeout : this.timeout
  }

  get rejectedCount() {
    return this.retryQueue.length
  }

  get undoCount() {
    return this.queue.length
  }

  add(task: Task | Task[]) {
    if (Array.isArray(task)) {
      this.queue.push(...task)
      this.taskCount += task.length
    }
    else {
      this.queue.push(task)
      this.taskCount++
    }
  }

  run() {
    this.state = 'running'
    for (let i = 0; i < this.maxConcurrent; i++)
      this.request()
  }

  private request() {
    if (!this.undoCount) {
      if (this.runningTask === 0) {
        if (this.retryCount > 0 && this.retryQueue.length > 0) {
          this.state = 'preRetry'
          setTimeout(() => {
            this.retryCount--
            this.queue.push(...this.retryQueue.splice(0, this.retryQueue.length))
            setTimeout(() => {
              this.state = 'retrying'
              this.run()
            }, 200)
          }, this.timeout - 200)
        }
        else {
          this.state = 'done'
          this.retryCount = this.retryBack
        }
      }
      return
    }

    if (this.runningTask >= this.maxConcurrent)
      return

    this.runningTask++

    const task = this.queue.shift()!

    task()
      .then(() => {
        this.fulfilledCount++
      })
      .catch(() => {
        this.retryQueue.push(task)
      })
      .finally(() => {
        this.runningTask--
        this.request()
      })
  }

  retry() {
    if (this.undoCount)
      return
    this.request()
  }
}
