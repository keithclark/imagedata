import Point from './Point.js';
import Path from './Path.js';

export default class CanvasPath {

  #subPaths = [];
  #currentSubPath = null;

  get subPaths() {
    return this.#subPaths;
  }

  close() {
    if (!this.#currentSubPath || this.#currentSubPath.points.length < 2) {
      return;
    }
    const { firstPoint } = this.#currentSubPath;
    this.#currentSubPath.addPoint(new Point(firstPoint.x, firstPoint.y));
    this.moveTo(firstPoint.x, firstPoint.y);
  }

  closePath() {
    if (this.#currentSubPath && !this.#currentSubPath.lastPoint) {
      return;
    }
    this.#currentSubPath = new Path();
    this.#subPaths.push(this.#currentSubPath);
  }

  moveTo(x, y) {
    this.closePath();
    this.#currentSubPath.addPoint(new Point(x, y));
  }

  lineTo(x, y) {
    if (!this.#currentSubPath) {
      this.moveTo(x, y);
    } else {
      this.#currentSubPath.addPoint(new Point(x, y));
    }
  }

  rect(x, y, w, h) {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.lineTo(x, y);
    this.moveTo(x, y);
  }

}