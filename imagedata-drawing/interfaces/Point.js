export default class Point {
  
  #x;
  #y;

  constructor(x = 0, y = 0) {
    this.#x = x;
    this.#y = y;
  }

  get x() {
    return this.#x;
  }

  set x(value) {
    this.#x = value;
  }

  get y() {
    return this.#y;
  }

  set y(value) {
    this.#y = value;
  }
}
