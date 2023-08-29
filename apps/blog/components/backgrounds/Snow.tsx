import { useEffect, useRef } from 'react'
import { useClientSize } from '@/hooks/useClientSize'
import { Theme } from '@/hooks/useTheme'

interface Point {
  x: number
  y: number
}
interface Branch {
  start: Point
  length: number
  theta: number
}

interface SnowflakeProps {
  length: number
  depth: number
  color: string
  lineWidth: number
  theta: number
}

class Snowflake {
  private PI = Math.PI
  private startTheta = [this.PI / 2, this.PI / 2 * 3, this.PI / 6, this.PI / 6 * 5, this.PI / 6 * 11, this.PI / 6 * 7]
  private b: Branch
  private offscreen: OffscreenCanvas
  private ctx: OffscreenCanvasRenderingContext2D

  constructor(private props: SnowflakeProps) {
    this.b = {
      start: {
        x: props.length,
        y: props.length,
      },
      length: props.length,
      theta: props.theta,
    }
    this.offscreen = new OffscreenCanvas(props.length * 2, props.length * 2)
    this.ctx = this.offscreen.getContext('2d')!
    this.ctx.strokeStyle = props.color
    this.ctx.lineWidth = props.lineWidth
  }

  init() {
    this.startTheta.forEach((theta) => {
      const nb = Object.assign({}, this.b, { theta: this.b.theta + theta })
      this.ctx.beginPath()
      this.step(nb, this.props.depth)
      this.ctx.stroke()
    })
    return this.offscreen.transferToImageBitmap()
  }

  private step(b: Branch, depth = 5) {
    if (depth <= 0)
      return
    this.drawBranch(b)
    const centerPoint = this.getCenterPoint(b.start, this.getEndPoint(b))
    this.step({
      start: centerPoint,
      length: b.length / 2,
      theta: b.theta,
    }, depth - 1)
    this.step({
      start: b.start,
      length: b.length / 2,
      theta: b.theta,
    }, depth - 1)
    this.step({
      start: centerPoint,
      length: b.length / 3,
      theta: b.theta + this.PI / 3,
    }, depth - 1)
    this.step({
      start: centerPoint,
      length: b.length / 3,
      theta: b.theta - this.PI / 3,
    }, depth - 1)
  }

  private getCenterPoint(start: Point, end: Point) {
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    }
  }

  private lineTo(p1: Point, p2: Point) {
    this.ctx.moveTo(p1.x, p1.y)
    this.ctx.lineTo(p2.x, p2.y)
  }

  private getEndPoint(b: Branch): Point {
    return {
      x: b.start.x + b.length * Math.cos(b.theta),
      y: b.start.y + b.length * Math.sin(b.theta),
    }
  }

  private drawBranch(b: Branch) {
    this.lineTo(b.start, this.getEndPoint(b))
  }
}

interface FlakeState extends Point {
  theta: number
  size: number
}

const grow = (ctx: CanvasRenderingContext2D, width: number, height: number, snowflakeProps: SnowflakeProps) => {
  const PI = Math.PI
  const per = Math.PI / 270
  const snowflake = new Snowflake(snowflakeProps).init()

  const flakeStates: FlakeState[] = []

  const generateState = () => {
    const size = Math.round(44 * Math.random()) + 20
    const x = Math.round((width - size) * Math.random())
    const y = Math.round((size - height) * Math.random())
    const theta = PI * Math.random()

    return { x, y, theta, size }
  }

  const generateStates = () => {
    const total = width * height / 20000
    for (let i = 0; i < total; i++)
      flakeStates.push(generateState())
    // console.log(total)
  }

  const drawFlake = ({ x, y, size, theta }: FlakeState) => {
    const moveX = x + size / 2
    const moveY = y + size / 2
    ctx.translate(moveX, moveY)
    ctx.rotate(theta)
    ctx.translate(-moveX, -moveY)
    ctx.drawImage(snowflake, x, y, size, size)
    ctx.resetTransform()
  }

  const updateState = (flakeState: FlakeState) => {
    if (flakeState.y > height) {
      Object.assign(flakeState, generateState())
    }
    else {
      flakeState.y += 1
      flakeState.theta += per
    }
  }

  function init() {
    generateStates()
    flakeStates.forEach(item => drawFlake(item))
  }

  init()

  function startFrame() {
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, width, height)

      flakeStates.forEach((item) => {
        drawFlake(item)
        updateState(item)
      })

      startFrame()
    })
  }

  startFrame()
}

interface SnowBGProps {
  theme: Theme
}

const SnowBG = ({ theme }: SnowBGProps) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const { width, height } = useClientSize()

  useEffect(() => {
    if (canvas.current) {
      const canvasEl = canvas.current
      const color = theme === Theme.LIGTH ? '#171a1c99' : '#dfe8ec99'
      const ctx = canvasEl.getContext('2d')!
      canvasEl.style.width = `${width}px`
      canvasEl.style.height = `${height}px`
      canvasEl.width = width
      canvasEl.height = height

      grow(ctx, width, height, { length: 100, depth: 5, color, lineWidth: 2, theta: 0 })
    }
  }, [canvas, theme, width, height])

  return (
    <div className='fixed top-0 right-0 bottom-0 left-0 pointer-events-none -z-10'>
      <canvas ref={canvas}></canvas>
    </div>
  )
}

export default SnowBG
