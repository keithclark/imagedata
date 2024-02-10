import Rect from './Rect.js';

export default class Path {

  points = [];

  addPoint(point) {
    this.points.push(point);
  }

  get lastPoint() {
    return this.points[this.points.length - 1];
  }

  get firstPoint() {
    return this.points[0];
  }

  /**
   * Returns a `Rect` representing a bounding box that contains all the points 
   * in the path. If the path has less than two points then `null` is returned.
   * 
   * @returns {Rect?} A `Rect` object representing the bounding box of the path
   */
  getBoundingRect() {
    if (this.points.length < 2) {
      return null;
    }

    let x1 = Number.MAX_VALUE;
    let y1 = Number.MAX_VALUE;
    let x2 = Number.MIN_VALUE;
    let y2 = Number.MIN_VALUE;

    this.points.forEach((point) => {
      x1 = Math.min(point.x, x1);
      x2 = Math.max(point.x, x2);
      y1 = Math.min(point.y, y1);
      y2 = Math.max(point.y, y2);
    });

    return new Rect(x1, y1, x2 - y1, y2 - y1);
  }

}
