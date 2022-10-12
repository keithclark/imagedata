import { line } from './line.js';

/**
 * @typedef {import('../interfaces/Path.js').default} Path
 * @typedef {import('../interfaces/PixelView.js').default} PixelView
 */

/**
 * Draws an outlined path in the specified view.
 * 
 * @param {PixelView} pixelView - The view to draw the path in
 * @param {Path} path - The path to draw
 * @param {Number} color - The color of the outline
 */
export const drawStrokedPath = (pixelView, path, color) => {
  path.subPaths.forEach(subPath => {
    let { x: x1, y: y1 } = subPath.points[0];
    for (let c = 1; c < subPath.points.length; c++) {
      let { x: x2, y: y2 } = subPath.points[c];
      line(pixelView, x1, y1, x2, y2, color);
      x1 = x2;
      y1 = y2;
    }
  });
};

/**
 * Draws a filled path in the specified view.
 * 
 * @param {PixelView} pixelView - The view to draw the path in
 * @param {Path} path - The path to fill
 * @param {Number} color - The color of the fill
 */
export const drawFilledPath = (pixelView, path, color) => {

  path.subPaths.forEach(subPath => {
    const { points } = subPath;
    const { top, bottom } = subPath.getBoundingRect();

    for (let y = top ; y <= bottom; y++) {
      const intersections = [];

      // Calculate the line intersection points for this row.
      let indexB = points.length - 1;
      for (let indexA = 0; indexA < points.length; indexA++) {
        const pointA = points[indexA];
        const pointB = points[indexB];
        if ((pointA.y <= y && pointB.y > y) || (pointB.y <= y && pointA.y > y)) {
          const deltaY = pointB.y - pointA.y;
          if (deltaY !== 0) {
            intersections.push({
              x: pointA.x + ((y - pointA.y) * (pointB.x - pointA.x)) / deltaY,
              slope: deltaY > 1 ? 1 : -1
            });
          }
        }
        indexB = indexA;
      }

      // Sort the intersections from left to right
      intersections.sort((a, b) => a.x - b.x);

      // Fill the pixels between node pairs.
      let x1 = 0;
      let s = 0;
      let intersectionCount = intersections.length;

      for (let i = 0; i < intersectionCount; i++) {
        if (s == 0) {
          x1 = intersections[i].x;
        }
        s += intersections[i].slope;
        if (!s || i == intersectionCount - 1) {
          let x2 = intersections[i].x;
          if (x2 > x1) {
            line(pixelView, x1 | 0, y, x2 | 0, y, color);
          }
        }
      }
    }
  });

};
