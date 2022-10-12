import Point from './Point.js';
import Subpath from './Subpath.js';

export default class Path {

  /** @type {Array<Subpath> } */
  subPaths = [];

  begin(x = 0, y = 0) {
    this.currentSubPath = new Subpath(x, y);
    this.subPaths.push(this.currentSubPath);
  }

  close() { 
    const { points } = this.currentSubPath;
    if (points.length > 1) {
      const { x: ex, y: ey } = points[points.length - 1];
      const { x: sx, y: sy } = points[0];
      if (ex !== sx || ey !== sy) {
        this.addPoint(sx, sy);
      }
    }
  }

  addPoint(x, y) {
    if (!this.currentSubPath) {
      this.begin();
    }
    this.currentSubPath.points.push(new Point(x, y));
  }

}
