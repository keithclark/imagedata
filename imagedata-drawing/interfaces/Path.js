export default class Path {

  #x = 0;
  #y = 0;
  subPaths = [];

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  begin(x = 0, y = 0) {
    this.currentSubPath = new Subpath(x, y);
    this.subPaths.push(this.currentSubPath);
    this.#x = x;
    this.#y = y;
  }

  close() {
    if (this.currentSubPath.points.length > 2) {
      const [sx, sy] = this.currentSubPath.points;
      this.addPoint(sx, sy);
      this.begin(sx, sy);
    }
  }

  addPoint(x, y) {
    if (!this.currentSubPath) {
      this.begin();
    }
    this.currentSubPath.points.push(x, y);
    this.#x = x;
    this.#y = y;
  }

}


class Subpath {
  constructor(x, y) {
    this.points = [x, y];
  }
}
