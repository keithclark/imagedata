/**
 * @typedef {import('../interfaces/PixelView.js').default} PixelView
 */

/**
 * Draws a line between two points
 * 
 * @param {PixelView} pixelView the view to draw the line to
 * @param {Number} x0 - The x-axis coordinate to draw from
 * @param {Number} y0 - The y-axis coordinate to draw from
 * @param {Number} x1 - The x-axis coordinate to draw to
 * @param {Number} y1 - The y-axis coordinate to draw to
 * @param {Number} color - The color to draw the line in
 */
export const line = (pixelView, x0, y0, x1, y1, color = 0xffffffff) => {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let step = dx - dy;

  // eslint-disable-next-line no-constant-condition
  while (true) {

    pixelView.blendColor(x0, y0, color);

    if (x0 === x1 && y0 === y1) {
      break;
    }

    const e2 = 2 * step;
    
    if (e2 > -dy) {
      step -= dy;
      x0 += sx;
    }

    if (e2 < dx) {
      step += dx;
      y0 += sy;
    }
  }
};
