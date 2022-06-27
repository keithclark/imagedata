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
 * @param {Number} color - The colour to draw in
 */
export const drawStrokedPath = (pixelView, path, color) => {
  path.subPaths.forEach(subPath => {
    let [x1, y1] = subPath.points.splice(0, 2);
    while (subPath.points.length) {
      let [x2, y2] = subPath.points.splice(0, 2);
      line(pixelView, x1, y1, x2, y2, color);
      x1 = x2;
      y1 = y2;
    }
  });
};
