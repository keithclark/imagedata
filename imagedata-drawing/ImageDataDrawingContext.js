import { drawText, getTextMetrics } from './text/fontRenderer.js';
import { drawStrokedRect, drawFilledRect } from './shapes/rect.js';
import { drawStrokedPath } from './shapes/path.js';
import { getFontByFamily, getDefaultFont } from './text/fontRegistry.js';
import { parseColor } from './lib/cssValueParsers.js';
import PixelView from './interfaces/PixelView.js';
import Path from './interfaces/Path.js';

/**
 * @typedef {import('./interfaces/TextMetrics.js').default} TextMetrics
 */

export class ImageDataDrawingContext {

  #strokeColor = 0x000000ff;
  #fillColor = 0x000000ff;
  #font;
  #pixelView;
  #path;

  constructor(imageData) {
    this.#pixelView = new PixelView(imageData);
    this.#path = new Path();
    this.#font = getDefaultFont();
  }

  /**
   * The font to use when rendering text
   * 
   * @type {String} The font family
   */
  get font() {
    return this.#font?.name || null;
  }

  set font(value) {
    const font = getFontByFamily(value);
    if (font !== null) {
      this.#font = font;
    }
  }

  /**
   * Color to use when outlining shapes.
   * 
   * @type {String} The CSS color to use as the stroke style
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
   * @type {String} The CSS color to use as the fill style
   */
  get fillStyle() {
    return `#${this.#strokeColor.toString(16).padStart(8, '0')}`;
  }

  set fillStyle(value) {
    const color = parseColor(value);
    if (color !== null) {
      this.#fillColor = color;
    }
  }

  beginPath() {
    this.#path = new Path();
  }

  closePath() {
    this.#path.close();
  }

  moveTo(x, y) {
    this.#path.begin(x, y);
  }

  lineTo(x, y) {
    this.#path.addPoint(x, y);
  }

  stroke() {
    drawStrokedPath(this.#pixelView, this.#path, this.#strokeColor);
  }

  /**
   * Draws an outlined rectangle using the current `strokeStyle`. 
   * 
   * @param {Number} x The x-axis coordinate of the rectangle's starting point.
   * @param {Number} y The y-axis coordinate of the rectangle's starting point.
   * @param {Number} width  The rectangle's width. Positive values are to the right, and negative to the left.
   * @param {Number} height The rectangle's height. Positive values are down, and negative are up.
   */
  strokeRect(x, y, width, height) {
    drawStrokedRect(this.#pixelView, x, y, width, height, this.#strokeColor);
  }

  /**
   * Fills a rectangular area of the image with transparent pixels.
   * 
   * @param {Number} x The x-axis coordinate of the rectangle's starting point.
   * @param {Number} y The y-axis coordinate of the rectangle's starting point.
   * @param {Number} width  The rectangle's width. Positive values are to the right, and negative to the left.
   * @param {Number} height The rectangle's height. Positive values are down, and negative are up.
   */
  clearRect(x, y, width, height) {
    drawFilledRect(this.#pixelView, x, y, width, height, 0x00000000, true);
  }

  /**
   * Draws a filled rectangle using the current `fillStyle`.
   * 
   * @param {Number} x The x-axis coordinate of the rectangle's starting point.
   * @param {Number} y The y-axis coordinate of the rectangle's starting point.
   * @param {Number} width  The rectangle's width. Positive values are to the right, and negative to the left.
   * @param {Number} height The rectangle's height. Positive values are down, and negative are up.
   */
  fillRect(x, y, width, height) {
    drawFilledRect(this.#pixelView, x, y, width, height, this.#fillColor);
  }

  /**
   * Draws the characters of a string at the specified coordinates in the 
   * current `fillStyle`. Note: this is identical to `strokeText()`, except that
   * the `fillStyle` is used instead of `strokeStyle`.
   * 
   * @param {String} text - The text to render
   * @param {Number} x The x-axis coordinate to start drawing the text.
   * @param {Number} y The y-axis coordinate to start drawing the text.
   */
  fillText(text, x, y) {
    drawText(this.#pixelView, text, x, y, this.#fillColor, this.#font);
  }

  /**
   * Draws the characters of a string at the specified coordinates in the 
   * current `strokeStyle`. Note: this is identical to `fillText()`, except that
   * the `strokeStyle` is used instead of `fillStyle`.
   * 
   * @param {String} text - The text to render
   * @param {Number} x The x-axis coordinate to start drawing the text.
   * @param {Number} y The y-axis coordinate to start drawing the text.
   */
  strokeText(text, x, y) {
    drawText(this.#pixelView, text, x, y, this.#strokeColor, this.#font);
  }

  /**
   * Returns a TextMetrics object that contains information about how the given
   * string will be rendered using the current font.
   * 
   * @param {string} text - The string to measure
   * @returns {TextMetrics} The text metrics of the string
   */
  measureText(text) {
    return getTextMetrics(text, this.#font);
  }

}
