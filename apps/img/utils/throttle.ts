export default function throttle(fn: (...args: any[]) => any, ms = 300) {
  let pre = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - pre > ms) {
      pre = now
      return fn(...args)
    }
  }
}
