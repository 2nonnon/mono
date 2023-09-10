export default class BezierCurve {
    constructor({ P2, P3, percision = 300, type = 'ease' } = {}) {
      if (P2 && P3) {
        this.curve = this.bezierCurve({ P2, P3 })
      } else {
        this.curve = this.bezierCurve(this.getTypePoint(type))
      }
      this.points = this.getPointSet(this.curve, percision)
      this.index = 0
    }
  
    getTypePoint(type) {
      switch (type) {
        case 'ease': return {
          P2: { x: 0.25, y: 0.1 }, P3: { x: 0.25, y: 1 }
        };
        case 'linear': return {
          P2: { x: 0, y: 0 }, P3: { x: 1, y: 1 }
        };
        case 'ease-in-out': return {
          P2: { x: 0.42, y: 0 }, P3: { x: 0.58, y: 1 }
        };
        case 'ease-in': return {
          P2: { x: 0.42, y: 0 }, P3: { x: 1, y: 1 }
        };
        case 'ease-out': return {
          P2: { x: 0, y: 0 }, P3: { x: 0.58, y: 1 }
        };
      }
    }
  
    resetIndex() {
      this.index = 0
    }
  
    getY(x) {
      return this.findApproximateValue(x)
    }
  
    findApproximateValue(x) {
      if (x <= 0) return 0;
      if (x >= 1) {
        this.resetIndex()
        return 1;
      }
      const index = this.index
      const points = this.points
      const length = points.length
      let p1, p2;
      for (let i = index; i < length; i++) {
        if (points[i].x === x) {
          this.index = i + 1
          return points[i].y
        } else if (points[i].x > x) {
          this.index = i + 1
          p1 = points[i]
          p2 = points[i - 1]
          break;
        }
      }
      // y = (x-x2) / (x1-x2) * (y1-y2) + y2
      if (p1 && p2) {
        return (x - p2.x) / (p1.x - p2.x) * (p1.y - p2.y) + p2.y
      }
  
      this.resetIndex()
      return 1;
    }
  
    getPointSet(f, precision) {
      return Array.from({ length: precision }).map((_, i) => f((i + 1) / precision))
    }
  
    bezierCurve({ P1 = { x: 0, y: 0 }, P2, P3, P4 = { x: 1, y: 1 } }) {
      return (t) => {
  
        const x = (1 - t) ** 3 * P1.x + 3 * (1 - t) ** 2 * t * P2.x + 3 * (1 - t) * t ** 2 * P3.x + t ** 3 * P4.x
  
        const y = (1 - t) ** 3 * P1.y + 3 * (1 - t) ** 2 * t * P2.y + 3 * (1 - t) * t ** 2 * P3.y + t ** 3 * P4.y
  
        return {
          x,
          y,
        }
      }
    }
  }