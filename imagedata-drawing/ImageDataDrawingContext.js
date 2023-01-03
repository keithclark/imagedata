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
   * @type {String} The font family
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
   * @type {String} The spacing value including unit
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
   * @type {String} The spacing value including unit
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
   * @param {Number} x - The x-axis coordinate of the new point
   * @param {Number} y - The y-axis coordinate of the new point
   */
  moveTo(x, y) {
    this.#currentPath.moveTo(x, y);
  }

  /**
   * Draws a line from the last sub-path point to a new sub-path point at the  
   * given coordinates
   * 
   * @param {Number} x - The x-axis coordinate of the new point
   * @param {Number} y - The y-axis coordinate of the new point
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
   * @param {Number} x The x-axis coordinate of the rectangle's starting point.
   * @param {Number} y The y-axis coordinate of the rectangle's starting point.
   * @param {Number} width  The rectangle's width. Positive values are to the right, and negative to the left.
   * @param {Number} height The rectangle's height. Positive values are down, and negative are up.
   */
  strokeRect(x, y, width, height) {
    const rectPath = new CanvasPath();
    rectPath.rect(x, y, width, height);
    this.#rasterizer.drawStrokedPath(rectPath, this.#strokeColor);
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
    const rectPath = new CanvasPath();
    rectPath.rect(x, y, width, height);
    this.#rasterizer.drawFilledPath(rectPath, this.#fillColor);
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
    this.#rasterizer.clear(x, y, width, height);
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
    this.#rasterizer.drawFilledText(text, x, y, this.#fillColor, this.#textStyle);
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
   * @type {{
   * (imageData: ImageData, dx:number, dy:number) => null;
   * (imageData: ImageData, dx:number, dy:number, dWidth:number, dHeight:number) => null;
   * }}
   */
  drawImage(imageData, ...args) {
    if (args.length === 2) {
      this.#rasterizer.drawImage(imageData, args[0], args[1]);
    } else if (args.length === 4) {
      this.#rasterizer.drawImage(imageData, args[0], args[1], args[2], args[3]);
    } else if (args.length === 8) {
      this.#rasterizer.drawImage(imageData, args[4], args[5], args[6], args[7], args[0], args[1], args[2], args[3]);
    } else {
      throw new SyntaxError('Incorrect number of arguments');
    }
  }

  /**
   * Draws the given source ImageData object onto the underyling ImageData, 
   * replacing any destination pixels with the source data. If a dirty rectangle
   * is provided, only the pixels from that rectangle are drawn.
   * 
   * @param {ImageData} imageData - The ImageData object containing the image to draw
   * @param {Number} dx - The x-axis coordinate to draw the image at. Can be negative
   * @param {Number} dy - The y-axis coordinate to draw the image at. Can be negative
   * @param {Number} dirtyX - The x-axis coordinate to start copying from. Can be negative. Defaults to `0`
   * @param {Number} dirtyY - The y-axis coordinate to start copying from. Can be negative. Defaults to `0`
   * @param {Number} dirtyWidth - The number of columns to copy.  Defaults to source width
   * @param {Number} dirtyHeight - The number of rows to copy. Defaults to source height
   */
  putImageData(imageData, dx, dy, dirtyX = 0, dirtyY = 0, dirtyWidth = imageData.width, dirtyHeight = imageData.height) {
    this.#rasterizer.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
  }
}
