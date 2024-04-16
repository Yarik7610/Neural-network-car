class Car {
  constructor(x, y, width, height, maxSpeed = 3, controlType) {
    this.x = x //центр машины по х
    this.y = y //центр машины по y
    this.width = width
    this.height = height
    this.controlType = controlType

    this.speed = 0
    this.maxSpeed = maxSpeed
    this.acceleration = 0.2
    this.friction = 0.05
    this.damaged = false
    this.angle = 0

    this.useBrain = controlType === 'AI' //если у нас даже и есть brain, то влиять на движение он будет только при useBrain = true

    if (this.controlType !== 'DUMMY') {
      this.sensor = new Sensor(this)
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4])
    }
    this.controls = new Controls(this.controlType)
  }
  #updateCoords() {
    if (this.controls.forward) {
      this.speed += this.acceleration
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration
    }
    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed
    if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2
    if (this.speed > 0) this.speed -= this.friction
    if (this.speed < 0) this.speed += this.friction
    if (Math.abs(this.speed) < this.friction) this.speed = 0

    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1
      if (this.controls.left) this.angle += 0.03 * flip
      if (this.controls.right) this.angle -= 0.03 * flip
    }

    this.y -= Math.cos(this.angle) * this.speed
    this.x -= Math.sin(this.angle) * this.speed
  }

  #createPolygon() {
    const points = []
    const radius = Math.hypot(this.width, this.height) / 2 //диагональ прямоугольника / 2
    const alpha = Math.atan2(this.width, this.height) //угол диагонали с длинной стороной
    //topRight
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * radius, //вспоминаем круг, sin по горизонтали ПИ/2 слева, -ПИ/2 справа, сверху 0 cos
      y: this.y - Math.cos(this.angle - alpha) * radius
    })
    //topLeft
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * radius, //вспоминаем круг, sin по горизонтали ПИ/2 слева, -ПИ/2 справа, сверху 0 cos
      y: this.y - Math.cos(this.angle + alpha) * radius
    })
    //bottomRight
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius, //вспоминаем круг, sin по горизонтали ПИ/2 слева, -ПИ/2 справа, сверху 0 cos
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius
    })
    //bottomRight
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius, //вспоминаем круг, sin по горизонтали ПИ/2 слева, -ПИ/2 справа, сверху 0 cos
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius
    })
    return points
  }

  #isDamaged(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) return true
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) return true
    }
    return false
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#updateCoords()
      this.polygon = this.#createPolygon()
      this.damaged = this.#isDamaged(roadBorders, traffic)
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic)
      const offsets = this.sensor.readings.map((r) => (r === null ? 0 : 1 - r.offset)) //низкие значения если далеко от объекта врезания, высокие - если близко
      const outputs = NeuralNetwork.feedForward(offsets, this.brain)
      if (this.useBrain) {
        this.controls.forward = outputs[0]
        this.controls.left = outputs[1]
        this.controls.right = outputs[2]
        this.controls.reverse = outputs[3]
      }
    }
  }

  draw(ctx, color, drawSensor = false) {
    if (this.damaged) ctx.fillStyle = 'gray'
    else ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
    }
    ctx.fill()
    if (this.sensor && drawSensor) this.sensor.draw(ctx)
  }
}
