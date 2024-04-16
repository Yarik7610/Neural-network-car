class Controls {
  constructor(controlType) {
    this.forward = false
    this.left = false
    this.right = false
    this.reverse = false
    switch (controlType) {
      case 'KEYS':
        this.#addEventListeners()
        break
      case 'DUMMY':
        this.forward = true
        break
    }
  }
  #addEventListeners() {
    const handleOnKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          this.forward = true
          break
        case 'ArrowDown':
          this.reverse = true
          break
        case 'ArrowLeft':
          this.left = true
          break
        case 'ArrowRight':
          this.right = true
      }
    }
    const handleOnKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          this.forward = false
          break
        case 'ArrowDown':
          this.reverse = false
          break
        case 'ArrowLeft':
          this.left = false
          break
        case 'ArrowRight':
          this.right = false
      }
    }
    document.addEventListener('keyup', handleOnKeyUp)
    document.addEventListener('keydown', handleOnKeyDown)
  }
}
