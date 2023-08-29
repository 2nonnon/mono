interface Point {
  x: number
  y: number
}

type CurveType = 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear'

interface BezierCurveProps {
  P2?: Point
  P3?: Point
  percision?: number
  curveType?: CurveType
}

type ParametricEquation = (t: number) => Point

export default class BezierCurve {
  private index = 0
  public points: Point[] = []
  public curve: ParametricEquation

  constructor({ P2, P3, percision = 300, curveType = 'ease' }: BezierCurveProps = {}) {
    if (P2 && P3)
      this.curve = this.bezierCurve({ P2, P3 })

    else
      this.curve = this.bezierCurve(this.getTypePoint(curveType))

    this.points = this.getPointSet(this.curve, percision)
  }

  getTypePoint(curveType: CurveType) {
    switch (curveType) {
      case 'ease': return {
        P2: { x: 0.25, y: 0.1 }, P3: { x: 0.25, y: 1 },
      }
      case 'linear': return {
        P2: { x: 0, y: 0 }, P3: { x: 1, y: 1 },
      }
      case 'easeInOut': return {
        P2: { x: 0.42, y: 0 }, P3: { x: 0.58, y: 1 },
      }
      case 'easeIn': return {
        P2: { x: 0.42, y: 0 }, P3: { x: 1, y: 1 },
      }
      case 'easeOut': return {
        P2: { x: 0, y: 0 }, P3: { x: 0.58, y: 1 },
      }
    }
  }

  resetIndex() {
    this.index = 0
  }

  getY(x: number) {
    return this.findApproximateValue(x)
  }

  findApproximateValue(x: number) {
    if (x <= 0)
      return 0
    if (x >= 1) {
      this.resetIndex()
      return 1
    }
    const index = this.index
    const points = this.points
    const length = points.length
    let p1: Point | undefined, p2: Point | undefined
    for (let i = index; i < length; i++) {
      if (points[i].x === x) {
        this.index = i + 1
        return points[i].y
      }
      else if (points[i].x > x) {
        this.index = i + 1
        p1 = points[i]
        p2 = points[i - 1]
        break
      }
    }
    // y = (x-x2) / (x1-x2) * (y1-y2) + y2
    if (p1 && p2)
      return (x - p2.x) / (p1.x - p2.x) * (p1.y - p2.y) + p2.y

    this.resetIndex()
    return 1
  }

  getPointSet(f: ParametricEquation, precision: number) {
    return Array.from({ length: precision }).map((_, i) => f((i + 1) / precision))
  }

  bezierCurve({ P1 = { x: 0, y: 0 }, P2, P3, P4 = { x: 1, y: 1 } }): ParametricEquation {
    return (t: number) => {
      const x = (1 - t) ** 3 * P1.x + 3 * (1 - t) ** 2 * t * P2.x + 3 * (1 - t) * t ** 2 * P3.x + t ** 3 * P4.x

      const y = (1 - t) ** 3 * P1.y + 3 * (1 - t) ** 2 * t * P2.y + 3 * (1 - t) * t ** 2 * P3.y + t ** 3 * P4.y

      return {
        x,
        y,
      }
    }
  }
}
