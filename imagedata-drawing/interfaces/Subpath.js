import Point from './Point.js';
import Rect from './Rect.js';

export default class Subpath {
  
  constructor(x, y) {
    this.points = [new Point(x, y)];
  }

  /**
   * Returns the bounding box for the path.
   * 
   * @returns {Rect} A `Rect` object representing the bounding box of the path
   */
  getBoundingRect() {
    if (!this.points.length) {
      return new Rect();
    }
    let x1 = Number.MAX_VALUE;
    let y1 = Number.MAX_VALUE;
    let x2 = Number.MIN_VALUE;
    let y2 = Number.MIN_VALUE;

    this.points.forEach(point => {
      x1 = Math.min(point.x, x1);
      x2 = Math.max(point.x, x2);
      y1 = Math.min(point.y, y1);
      y2 = Math.max(point.y, y2);
    });

    return new Rect(x1, y1, x2 - y1, y2 - y1);
  }
}
