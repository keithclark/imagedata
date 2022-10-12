import { drawText, getTextMetrics } from './text/fontRenderer.js';
import { drawStrokedRect, drawFilledRect } from './shapes/rect.js';
import { drawStrokedPath, drawFilledPath } from './shapes/path.js';
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

  /**
   * @param {ImageData} imageData The `ImageData` object to draw to
   */
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

  /**
   * Begins a new sub-path
   */
  beginPath() {
    this.#path = new Path();
  }

  /**
   * Connects the last point in the current sub-path to the first point. If the 
   * last and first points are the same coordinates, this method does nothing.
   */
  closePath() {
    this.#path.close();
  }

  /**
   * Begins a new-sub path at the given coordinates
   * 
   * @param {Number} x - The x-axis coordinate of the new point
   * @param {Number} y - The y-axis coordinate of the new point
   */
  moveTo(x, y) {
    this.#path.begin(x, y);
  }

  /**
   * Draws a line from the last sub-path point to a new sub-path point at the  
   * given coordinates
   * 
   * @param {Number} x - The x-axis coordinate of the new point
   * @param {Number} y - The y-axis coordinate of the new point
   */
  lineTo(x, y) {
    this.#path.addPoint(x, y);
  }

  /**
   * Outlines the current path with the current stroke style
   */
  stroke() {
    drawStrokedPath(this.#pixelView, this.#path, this.#strokeColor);
  }

  /**
   * Fills the current path with the current fill style
   */
  fill() {
    drawFilledPath(this.#pixelView, this.#path, this.#fillColor);
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
