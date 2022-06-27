import { line } from './line.js';

/**
 * @typedef {import('../interfaces/PixelView.js').default} PixelView
 */

/**
 * Draws an oultined rectangle
 * 
 * @param {PixelView} pixelView - The view to draw the rectangle in
 * @param {Number} x - The x-axis coordinate of the rectangle's starting point.
 * @param {Number} y - The y-axis coordinate of the rectangle's starting point.
 * @param {Number} width - The rectangle's width. Positive values are to the right, and negative to the left.
 * @param {Number} height - The rectangle's height. Positive values are down, and negative are up.
 * @param {Number} color - The color to draw the outline in
 */
export const drawStrokedRect = (pixelView, x, y, width, height, color = 0xffffffff) => {
  line(pixelView, x, y, x + width - 1, y, color);
  line(pixelView, x + width, y, x + width, y + height, color);
  line(pixelView, x + 1, y + height, x + width - 1, y + height, color);
  line(pixelView, x, y + height, x, y + 1, color);
};


/**
 * Draws an filled rectangle
 * 
 * @param {PixelView} pixelView - The view to draw the rectangle in
 * @param {Number} x - The x-axis coordinate of the rectangle's starting point.
 * @param {Number} y - The y-axis coordinate of the rectangle's starting point.
 * @param {Number} width - The rectangle's width. Positive values are to the right, and negative to the left.
 * @param {Number} height - The rectangle's height. Positive values are down, and negative are up.
 * @param {Number} color - The color to fill the rectangle with
 * @param {Number} noBlending - Controls if the rectangle fill blend with other pixels or not.
 */
export const drawFilledRect = (pixelView, x, y, width, height, color = 0xffffffff, noBlending = false) => {
  const { width: imageDataWidth, height: imageDataHeight } = pixelView.imageData;

  let drawMethod;

  if (width < 0) {
    x += width;
    width *= -1;
  }

  if (height < 0) {
    y += height;
    height *= -1;
  }

  const startRow = Math.max(0, y);
  const endRow = Math.min(y + height, imageDataHeight);
  const startCol = Math.max(0, x);
  const endCol = Math.min(x + width, imageDataWidth);
  
  if (startCol === endCol || startRow === endRow) {
    return;
  }

  if (noBlending) {
    drawMethod = pixelView.setColor.bind(pixelView);
  } else {
    drawMethod = pixelView.blendColor.bind(pixelView);
  }
  
  for (let col = startCol; col < endCol; col++) {
    for (let row = startRow; row < endRow; row++) {
      drawMethod(col, row, color);
    }
  }
};
