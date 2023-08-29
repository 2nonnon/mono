import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
}
interface Branch {
  start: Point
  length: number
  theta: number
}

const grow = (ctx: CanvasRenderingContext2D, option = {
  start: { x: 0, y: 0 },
  length: 10,
  theta: Math.PI / 4,
}) => {
  function init() {
    ctx.strokeStyle = '#fff5'
    step(option)
  }

  let pendingTasks: Function[] = []

  function step(b: Branch, depth = 0) {
    const end = getEndPoint(b)
    drawBranch(b)
    if (depth < 4 || Math.random() < 0.5) {
      pendingTasks.push(() => step({
        start: end,
        length: b.length + (Math.random() * 2 - 1),
        theta: b.theta - 0.2 * Math.random(),
      }, depth + 1))
    }
    if (depth < 4 || Math.random() < 0.5) {
      pendingTasks.push(() => step({
        start: end,
        length: b.length + (Math.random() * 2 - 1),
        theta: b.theta + 0.2 * Math.random(),
      }, depth + 1))
    }
  }

  function frame() {
    const tasks: Function[] = []
    pendingTasks = pendingTasks.filter((i) => {
      if (Math.random() > 0.4) {
        tasks.push(i)
        return false
      }
      return true
    })
    tasks.forEach(fn => fn())
  }

  let framesCount = 0

  function startFrame() {
    requestAnimationFrame(() => {
      framesCount += 1
      if (framesCount % 3 === 0)
        frame()
      startFrame()
    })
  }

  startFrame()

  function lineTo(p1: Point, p2: Point) {
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

  function getEndPoint(b: Branch): Point {
    return {
      x: b.start.x + b.length * Math.cos(b.theta),
      y: b.start.y + b.length * Math.sin(b.theta),
    }
  }

  function drawBranch(b: Branch) {
    lineTo(b.start, getEndPoint(b))
  }

  init()
}

const PlumBG = () => {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext('2d')!
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      canvas.current.style.width = `${width}px`
      canvas.current.style.height = `${height}px`
      canvas.current.width = width
      canvas.current.height = height
      console.log({ width, height })
      grow(ctx)
      grow(ctx, { start: { x: width, y: 0 }, length: 10, theta: Math.PI / 4 * 3 })
      grow(ctx, { start: { x: 0, y: height }, length: 10, theta: -Math.PI / 4 })
      grow(ctx, { start: { x: width, y: height }, length: 10, theta: -Math.PI / 4 * 3 })
    }
  }, [canvas])

  return (
    <div className='fixed top-0 right-0 bottom-0 left-0 pointer-events-none mask-image'>
      <canvas ref={canvas}></canvas>
    </div>
  )
}

export default PlumBG
