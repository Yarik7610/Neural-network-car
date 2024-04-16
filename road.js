class Road {
  constructor(x, width, laneCount = 3) {
    this.x = x
    this.width = width
    this.laneCount = laneCount

    this.left = x - width / 2
    this.right = x + width / 2

    const infinity = 1000000
    this.top = -infinity //ось y в canvas вниз
    this.bottom = infinity

    const topLeft = { x: this.left, y: this.top }
    const topRight = { x: this.right, y: this.top }
    const bottomLeft = { x: this.left, y: this.bottom }
    const bottomRight = { x: this.right, y: this.bottom }

    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight]
    ]
  }

  getLaneCenter(laneIndex) {
    //laneIndex - номер дорожки (от 0)
    const laneWidth = this.width / this.laneCount
    return this.left + Math.min(laneIndex, this.laneCount - 1) * laneWidth + laneWidth / 2
  }
  draw(ctx) {
    ctx.lineWidth = 5
    ctx.strokeStyle = 'white'

    //рисуем разметку
    for (let i = 1; i < this.laneCount; i++) {
      const x = lerp(this.left, this.right, i / this.laneCount)
      ctx.setLineDash([20, 20]) //длина линии и длина пропуска
      ctx.beginPath()
      ctx.moveTo(x, this.top)
      ctx.lineTo(x, this.bottom)
      ctx.stroke()
    }
    //рисуем белый полосы крайние
    ctx.setLineDash([])
    this.borders.forEach((border) => {
      ctx.beginPath()
      ctx.moveTo(border[0].x, border[0].y)
      ctx.lineTo(border[1].x, border[1].y)
      ctx.stroke()
    })
  }
}
