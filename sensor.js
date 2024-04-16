class Sensor {
  constructor(car) {
    this.car = car
    this.rayCount = 5
    this.rayLength = 150
    this.raySpread = Math.PI / 2 //угол в 90 между крайними лучами (промежуток в котором у нас весь получается конус обзора) радусов между лучами, можно поменять коэффициент на 2 вместо *1/4 тогда будет во весь круг
    this.rays = []
    this.readings = []
  }
  #updateRays() {
    this.rays = [] //зануляем при каждом кадре, чтобы не было следа со старыми координатами
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1) //от 0 до 2 включая, поэтому ... / this.rayCount - 1
        ) + this.car.angle //вспоминаем круг перевернутый где ось х - sin, слева ПИ/2, справа -П/2, а также добавляем угол машины, чтобы сенсоры поворачивались за тачкой, если луч один то размещаем его просто вертикально
      const start = {
        x: this.car.x,
        y: this.car.y
      }
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength, //умножаем на длину луча, т.к круг это как один пиксель (круг радиусом в 1 пиксель типо)
        y: this.car.y - Math.cos(rayAngle) * this.rayLength
      }
      this.rays.push([start, end])
    }
  }
  update(roadBorders, traffic) {
    this.#updateRays()
    this.readings = [] //массив всех лучей, если луч что то пересекает, то будет объект вида {x, y, offset} причем записан будет луч с минимальным оффсетом сюда (ибо луч может быть в машине а может быть в краю дороги), x y - точка пересечения, иначе будет null
    for (let ray of this.rays) {
      this.readings.push(this.#getReading(ray, roadBorders, traffic))
    }
  }

  #getReading(ray, roadBorders, traffic) {
    let touches = []
    for (let i = 0; i < roadBorders.length; i++) {
      //проверка одного луча с 2 краями дороги
      const touch = getIntersection(ray[0], ray[1], roadBorders[i][0], roadBorders[i][1])
      if (touch) touches.push(touch)
    }
    for (let i = 0; i < traffic.length; i++) {
      //проверка одного луча со всеми сегментами других машин
      const poly = traffic[i].polygon
      for (let j = 0; j < poly.length; j++) {
        const touch = getIntersection(ray[0], ray[1], poly[j], poly[(j + 1) % poly.length])
        if (touch) touches.push(touch)
      }
    }
    if (touches.length === 0) return null
    const offsets = touches.map((t) => t.offset) //массив длины сенсора от машины до границы
    const minOffest = Math.min(...offsets)
    return touches.find((t) => t.offset === minOffest) //находим минимальный оффсет, самый опасный как бы луч, который щас врежется
  }
  draw(ctx) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1] //конец луча по дефолту
      if (this.readings[i]) end = this.readings[i] //если у нас было пересечение луча, то мы конец заменяем концом луча, перескающим дорогу
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'yellow'
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y)
      ctx.lineTo(end.x, end.y) //рисуем луч только до пересечения с дорогой, дальше нет
      ctx.stroke()

      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'black'
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y)
      ctx.lineTo(end.x, end.y) //рисуем луч только до пересечения с дорогой, дальше нет
      ctx.stroke()
    }
  }
}
