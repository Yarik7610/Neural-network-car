const lerp = (from, to, percentage) => from + (to - from) * percentage //linear entrapolation, благодаря это функции находи координаты какой то линии, зная лишь их кол-во и начальную координату первой линии

const getIntersection = (A, B, C, D) => {
  let tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)
  let uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y)
  let bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y) //bottom (для обоих)
  if (bottom !== 0) {
    let t = tTop / bottom
    let u = uTop / bottom
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t
      }
    }
  }
  return null
}

const polysIntersect = (poly1, poly2) => {
  //сравниваем каждый сегмент первого полигона со всеми сегментами второго поочередно
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(
        poly1[i],
        poly1[(i + 1) % poly1.length],
        poly2[j],
        poly2[(j + 1) % poly2.length]
      ) //poly1[(i+1)%poly1.length] берем следующую за poly1[i] точку, и проверяем эту линию с дорогой, модуль нужен для того, чтобы соеденить последнюю точку с начальной, например 0 с 1, 1 со 2, 2 с 3, 3 с 0 (а то так будет 3 с 4, а 4 это выход за массив)
      if (touch) return true
    }
  }
  return false
}

function getRGBA(value) {
  const alpha = Math.abs(value)
  const R = value < 0 ? 0 : 255
  const G = R
  const B = value > 0 ? 0 : 255
  return 'rgba(' + R + ',' + G + ',' + B + ',' + alpha + ')'
}
