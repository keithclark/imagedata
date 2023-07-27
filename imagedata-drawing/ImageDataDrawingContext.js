import { getFontByFamily, getDefaultFont } from './text/fontRegistry.js';
import { parseColor } from './lib/cssValueParsers.js';
import CanvasPath from './interfaces/CanvasPath.js';
import Rasterizer from './interfaces/Rasterizer.js';
import TextStyle from './interfaces/TextStyle.js';

/**
 * @typedef {import('./interfaces/TextMetrics.js').default} TextMetrics
 * @typedef {import('imagedata').default} ImageData
 */

/** 
 * 
 */
export default class ImageDataDrawingContext {
  #rasterizer;
  #strokeColor = 0x000000ff;
  #fillColor = 0x000000ff;
  #textStyle;
  #currentPath;

  /**
   * @param {ImageData} imageData The `ImageData` object to draw to
   */
  constructor(imageData) {
    this.#rasterizer = new Rasterizer(imageData);
    this.#currentPath = new CanvasPath();
    this.#textStyle = new TextStyle();
    this.#textStyle.font = getDefaultFont();
  }

  /**
   * The font to use when rendering text
   * 
   * @type {string} The font family
   * @example context.font = "pixi"
   */
  get font() {
    return this.#textStyle.font?.name || null;
  }

  set font(value) {
    const font = getFontByFamily(value);
    if (font !== null) {
      this.#textStyle.font = font;
    }
  }

  /**
   * Color to use when outlining shapes.
   * 
   * @type {string} The CSS color to use as the stroke style
   * @example
   * context.strokeStyle = "orange";
   * context.strokeStyle = "#ff0000";
   * context.strokeStyle = "rgb(255,0,255,.5)";
   * context.strokeStyle = "hsla(255 50% 50% / .5)";
   */
  get strokeStyle() {
    return `#${this.#strokeColor.toString(16).padStart(8, '0')}`;
  }

  set strokeStyle(value) {
    const color = parseColor(value);
    if (color !== null) {
      this.#strokeColor = color;
    }
  }

  /**
   * Color to use when filling shapes. 
   * 
   * @type {string} The CSS color to use as the fill style
   * @example 
   * context.fillStyle = "red";
   * context.fillStyle = "#f0f";
   * context.fillStyle = "rgba(255,0,255,.5)";
   * context.fillStyle = "hsl(255,50%,50%)";
   */
  get fillStyle() {
    return `#${this.#fillColor.toString(16).padStart(8, '0')}`;
  }

  set fillStyle(value) {
    const color = parseColor(value);
    if (color !== null) {
      this.#fillColor = color;
    }
  }

  /**
   * Get or set the spacing between letters when rendering text.
   * 
   * @type {string} The spacing value including unit
   * @example context.letterSpacing = "1.5px";
   */
  get letterSpacing() {
    return this.#textStyle.letterSpacing;
  }
  
  set letterSpacing(value) {
    this.#textStyle.letterSpacing = parseFloat(value) | 0;
  }

  /**
   * Get or set the spacing between words when rendering text.
   * 
   * @type {string} The spacing value including unit
   * @example context.wordSpacing = "3px";
   */
  get wordSpacing() {
    return this.#textStyle.wordSpacing;
  }
  
  set wordSpacing(value) {
    this.#textStyle.wordSpacing = parseFloat(value) | 0;
  }

  /**
   * Begins a new sub-path
   */
  beginPath() {
    this.#currentPath = new CanvasPath();
  }

  /**
   * Connects the last point in the current sub-path to the first point. If the 
   * last and first points are the same coordinates, this method does nothing.
   */
  closePath() {
    this.#currentPath.close();
  }

  /**
   * Begins a new-sub path at the given coordinates
   * 
   * @param {number} x - The x-axis coordinate of the new point
   * @param {number} y - The y-axis coordinate of the new point
   */
  moveTo(x, y) {
    this.#currentPath.moveTo(x, y);
  }

  /**
   * Draws a line from the last sub-path point to a new sub-path point at the  
   * given coordinates
   * 
   * @param {number} x - The x-axis coordinate of the new point
   * @param {number} y - The y-axis coordinate of the new point
   */
  lineTo(x, y) {
    this.#currentPath.lineTo(x, y);
  }

  /**
   * Outlines the current path with the current stroke style
   */
  stroke() {
    this.#rasterizer.drawStrokedPath(this.#currentPath, this.#strokeColor);
  }

  /**
   * Fills the current path with the current fill style
   */
  fill() {
    this.#rasterizer.drawFilledPath(this.#currentPath, this.#fillColor);
  }

  /**
   * Draws an outlined rectangle using the current `strokeStyle`. 
   * 
   * @param {number} x The x-axis coordinate of the rectangle's starting point.
   * @param {number} y The y-axis coordinate of the rectangle's starting point.
   * @param {number} width  The rectangle's width. Positive values are to the right, and negative to the left.
   * @param {number} height The rectangle's height. Positive values are down, and negative are up.
   */
  strokeRect(x, y, width, height) {
    const rectPath = new CanvasPath();
    rectPath.rect(x, y, width, height);
    this.#rasterizer.drawStrokedPath(rectPath, this.#strokeColor);
  }

  /**
   * Draws a filled rectangle using the current `fillStyle`.
   * 
   * @param {number} x The x-axis coordinate of the rectangle's starting point.
   * @param {number} y The y-axis coordinate of the rectangle's starting point.
   * @param {number} width  The rectangle's width. Positive values are to the right, and negative to the left.
   * @param {number} height The rectangle's height. Positive values are down, and negative are up.
   */
  fillRect(x, y, width, height) {
    const rectPath = new CanvasPath();
    rectPath.rect(x, y, width, height);
    this.#rasterizer.drawFilledPath(rectPath, this.#fillColor);
  }

  /**
   * Fills a rectangular area of the image with transparent pixels.
   * 
   * @param {number} x The x-axis coordinate of the rectangle's starting point.
   * @param {number} y The y-axis coordinate of the rectangle's starting point.
   * @param {number} width  The rectangle's width. Positive values are to the right, and negative to the left.
   * @param {number} height The rectangle's height. Positive values are down, and negative are up.
   */
  clearRect(x, y, width, height) {
    this.#rasterizer.clear(x, y, width, height);
  }

  /**
   * Draws the characters of a string at the specified coordinates in the 
   * current `fillStyle`. Note: this is identical to `strokeText()`, except that
   * the `fillStyle` is used instead of `strokeStyle`.
   * 
   * @param {string} text - The text to render
   * @param {number} x The x-axis coordinate to start drawing the text.
   * @param {number} y The y-axis coordinate to start drawing the text.
   * @example context.fillText("I am filled", 20, 20)
   */
  fillText(text, x, y) {
    this.#rasterizer.drawFilledText(text, x, y, this.#fillColor, this.#textStyle);
  }

  /**
   * Draws the characters of a string at the specified coordinates in the 
   * current `strokeStyle`. Note: this is identical to `fillText()`, except that
   * the `strokeStyle` is used instead of `fillStyle`.
   * 
   * @param {string} text - The text to render
   * @param {number} x The x-axis coordinate to start drawing the text.
   * @param {number} y The y-axis coordinate to start drawing the text.
   * @example context.strokeText("I have a stroked outline", 20, 20)
   */
  strokeText(text, x, y) {
    this.#rasterizer.drawStrokedText(text, x, y, this.#strokeColor, this.#textStyle);
  }

  /**
   * Returns a TextMetrics object that contains information about how the given
   * string will be rendered using the current font.
   * 
   * @param {string} text - The string to measure
   * @returns {TextMetrics} The text metrics of the string
   */
  measureText(text) {
    return this.#rasterizer.getTextMetrics(text, this.#textStyle);
  }


  /**
   * Draws an ImageData onto the image, preserving transparency and with optional
   * scaling.
   * 
   * @param {ImageData} image - The image object to draw
   * @param {number} dx - The x-axis coordinate to place the image in the destination image. Can be negative
   * @param {number} dy - The y-axis coordinate to place the image in the destination image. Can be negative
   * @param {number} [dWidth] - The width to draw the source image in the destination image. If omitted, the source image is drawn at its natural width.
   * @param {number} [dHeight] - The height to draw the source image in the destination image. If omitted, the source image is drawn at its natural height.
   * @param {number} [sx=0] - The x-axis coordinate of the top-left corner from which the image data will be extracted. Can be negative
   * @param {number} [sy=0] - The y-axis coordinate of the top-left corner from which the image data will be extracted. Can be negative
   * @param {number} [sWidth] - Width of the source image data to extract. If omitted, the source image is drawn at its natural width.
   * @param {number} [sHeight] - Height of the source image data to extract. If omitted, the source image is drawn at its natural height.
   * @paramlist image, dx, dy
   * @paramlist image, dx, dy, dWidth, dHeight
   * @paramlist image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
   */
  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    if (arguments.length === 3) {
      this.#rasterizer.drawImage(image, 0, 0, image.width, image.height, sx, sy, image.width, image.height);
    } else if (arguments.length === 5) {
      this.#rasterizer.drawImage(image, 0, 0, image.width, image.height, sx, sy, sWidth, sHeight);
    } else if (arguments.length === 9) {
      this.#rasterizer.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    } else {
      throw new SyntaxError('Incorrect number of arguments');
    }
  }


  /**
   * Draws the given source ImageData object onto the underyling ImageData, 
   * replacing any destination pixels with the source data. If a dirty rectangle
   * is provided, only the pixels from that rectangle are drawn.
   * 
   * @param {ImageData} image - The ImageData object containing the image to draw
   * @param {number} dx - The x-axis coordinate to draw the image at. Can be negative
   * @param {number} dy - The y-axis coordinate to draw the image at. Can be negative
   * @param {number} [dirtyX=0] - The x-axis coordinate to start copying from. Can be negative.
   * @param {number} [dirtyY=0] - The y-axis coordinate to start copying from. Can be negative.
   * @param {number} [dirtyWidth] - The number of columns to copy.  Defaults to source image width
   * @param {number} [dirtyHeight] - The number of rows to copy. Defaults to source image height
   * @paramlist image, dx, dy
   * @paramlist image, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight
   */
  putImageData(image, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    if (arguments.length === 3) {
      this.#rasterizer.putImageData(image, dx, dy, 0, 0, image.width, image.height);
    } else if (arguments.length === 7) {
      this.#rasterizer.putImageData(image, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    } else {
      throw new SyntaxError('Incorrect number of arguments');
    }
  }
}
