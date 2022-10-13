import PixelView from './PixelView.js';
import Rect from './Rect.js';
import TextMetrics from './TextMetrics.js';
import TextWalker from './TextWalker.js';

/**
 * @typedef {import('./Path.js').default} Path
 * @typedef {import('./TextStyle.js').default} TextStyle
 */

export default class Rasterizer {

  /** @type {PixelView} */
  #pixelView;


  /**
   * @param {ImageData} imageData The `ImageData` instance to draw to
   */
  constructor(imageData) {
    this.#pixelView = new PixelView(imageData);
  }


  /**
   * Clears a rectangular area of image data by setting the RGBA value to zero
   * for each pixel.
   * 
   * @param {Number} x - The x-axis coordinate to draw from
   * @param {Number} y - The y-axis coordinate to draw from
   * @param {Number} width - Number of pixels to clear on the x-axis (can be negative)
   * @param {Number} height - Number of pixels to clear on the y-axis (can be negative)
   */
  clear(x, y, width, height) {
    const bounds = new Rect(x, y, width, height);
    const { height: imageHeight, width: imageWidth } = this.#pixelView.imageData;
    const startCol = Math.min(imageWidth, Math.max(bounds.left, 0));
    const endCol = Math.max(0, Math.min(bounds.right, imageWidth));
    const startRow = Math.min(imageHeight, Math.max(bounds.top, 0));
    const endRow = Math.max(0, Math.min(bounds.bottom, imageHeight));

    if (startCol === endCol || startRow === endRow) {
      return;
    }
    
    for (let col = startCol; col < endCol; col++) {
      for (let row = startRow; row < endRow; row++) {
        this.#pixelView.setColor(col, row, 0);
      }
    }
  }


  /**
   * Draws a line between two points
   * 
   * @param {Number} x0 - The x-axis coordinate to draw from
   * @param {Number} y0 - The y-axis coordinate to draw from
   * @param {Number} x1 - The x-axis coordinate to draw to
   * @param {Number} y1 - The y-axis coordinate to draw to
   * @param {Number} color - The color to draw the line in
   */
  drawLine(x0, y0, x1, y1, color = 0xffffffff) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let step = dx - dy;

    const setPixel = this.#pixelView.getOptimalRenderMethodForColor(color);

    // eslint-disable-next-line no-constant-condition
    while (true) {

      setPixel(x0, y0, color);

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
  }


  /**
   * Draws an outlined path in the specified view.
   * 
   * @param {Path} path - The path to draw
   * @param {Number} color - The color of the outline
   */
  drawStrokedPath(path, color = 0xffffffff) {
    path.subPaths.forEach(subPath => {
      const { points } = subPath;

      // If there are less than two points we can't stroke this path
      if (points.length < 2) {
        return;
      }

      let { x: x1, y: y1 } = points[0];
      for (let c = 1; c < points.length; c++) {
        const { x: x2, y: y2 } = points[c];
        this.drawLine(x1, y1, x2, y2, color);
        x1 = x2;
        y1 = y2;
      }
    });
  }


  /**
   * Draws a filled path in the specified view.
   * 
   * @param {PixelView} pixelView - The view to draw the path in
   * @param {Path} path - The path to fill
   * @param {Number} color - The color of the fill
   */
  drawFilledPath(path, color = 0xffffffff) {

    path.subPaths.forEach(subPath => {
      const { points } = subPath;

      // If there are less than three points we can't fill this path
      if (points.length < 3) {
        return;
      }

      const { top, bottom } = subPath.getBoundingRect();

      for (let y = top; y <= bottom; y++) {
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
            x1 = intersections[i].x + .5;
          }
          s += intersections[i].slope;
          if (!s || i == intersectionCount - 1) {
            let x2 = intersections[i].x - .5;
            if (x2 > x1) {
              this.drawLine(x1 | 0, y, x2 | 0, y, color);
            }
          }
        }
      }
    });
  }

  drawStrokedText(text, x, y, color = 0xfffffff, textStyle) {
    this.drawFilledText(text, x, y, color, textStyle);
  }

  /**
   * Renders a string of characters using a PixelView
   * 
   * @param {String} text - The text string to render
   * @param {Number} x - The y-axis coordinate to render the text at
   * @param {Number} y - The y-axis coordinate to render the text at
   * @param {Number} color - The color to render the text in
   * @param {TextStyle} textStyle - The style to render the text in
   */
  drawFilledText(text, x, y, color = 0xfffffff, textStyle) {
    const walker = new TextWalker(text, textStyle);
    const setPixel = this.#pixelView.getOptimalRenderMethodForColor(color);

    walker.walk((glyph, space) => {
      const { vOffset = 0, width, data } = glyph;
      const { length: height } = data;
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          if (data[row] >> (width - col - 1) & 1) {
            setPixel(x + col, y + row - textStyle.font.baseHeight + vOffset, color);
          }
        }
      }
      x += width + space;
    });
  }

  /**
   * Measures a string of text when rendered with a font and returns a 
   * `TextMetrics` instance containing the details.
   * 
   * @param {String} text - The string of text to measure
   * @param {TextStyle} textStyle - The font to use
   * @returns {TextMetrics} The text metrics for the string
   */
  getTextMetrics(text, textStyle) {
    const walker = new TextWalker(text, textStyle);
    let width = 0;
    let top = 0;
    let bottom = 0;
    const { font } = textStyle;

    walker.walk((glyph, space) => {
      const glyphHeight = glyph.data.length;
      const { vOffset = 0 } = glyph;
      width += glyph.width + space;
      top = Math.min(top, vOffset);
      bottom = Math.max(bottom, vOffset + glyphHeight - font.baseHeight);
    });

    return new TextMetrics(
      -top + font.baseHeight,
      bottom,
      0,
      width
    );
  }
}
