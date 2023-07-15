import { mix } from '../lib/colorUtils.js';

/**
 * The PixelView view provides an interface for reading and writing pixels in 
 * ImageData objects by accessing the RGBA values in the underlying array 
 * buffer.
 */
export default class PixelView {

  /** @type {DataView} */
  #dataView;

  /** @type {Number} */
  #width;

  /** @type {Number} */
  #height;

  /** @type {ImageData} */
  #imageData;

  /**
   * Creates a new PixelView object.
   * 
   * @param {ImageData} imageData 
   */
  constructor(imageData) {
    this.#dataView = new DataView(imageData.data.buffer);
    this.#width = imageData.width;
    this.#height = imageData.height;
    this.#imageData = imageData;
  }

  /**
   * The ImageData referenced by this view.
   * @type {ImageData}
   */
  get imageData() {
    return this.#imageData;
  }

  /**
   * Returns the unsigned 32 bit integer RGBA color value of a specific pixel.
   * If the coordinates are outside the image space, `null` will be returned.
   * 
   * @param {Number} x The x-axis coordinate of the pixel.
   * @param {Number} y The y-axis coordinate of the pixel.
   * @returns {Number|null} The color of the pixel.
   */
  getColor(x, y) {
    x |= 0;
    y |= 0;
    if (y >= 0 && x >= 0 && x < this.#width && y < this.#height) {
      return this.#dataView.getUint32((y * this.#width + x) * 4);
    }
    return null;
  }

  /**
   * Sets a specific pixel to an unsigned 32 bit integer RGBA color value.
   * 
   * @param {Number} x The x-axis coordinate of the pixel.
   * @param {Number} y The y-axis coordinate of the pixel.
   * @param {Number} color Unsigned 32 bit integer color value 
   */
  setColor(x, y, color) {
    x |= 0;
    y |= 0;
    if (x >= 0 && y >= 0 && x < this.#width && y < this.#height) {
      this.#dataView.setUint32((y * this.#width + x) * 4, color);
    } 
  }

  /**
   * Blends a new color with the current color at specific pixel. Use this 
   * method to allow transparency effects. If the new color is not transparent,
   * you should use `setColor` for better performance.
   * 
   * @param {Number} x The x-axis coordinate of the pixel.
   * @param {Number} y The y-axis coordinate of the pixel.
   * @param {Number} color Unsigned 32 bit integer color value 
   */
  blendColor(x, y, color) {
    x |= 0;
    y |= 0;
    if (x >= 0 && y >= 0 && x < this.#width && y < this.#height) {
      const mixedColor = mix(this.getColor(x, y), color);
      this.#dataView.setUint32((y * this.#width + x) * 4, mixedColor);
    }     
  }

  /**
   * Returns the optimal method to call for rendering a pixel based on the alpha
   * channel of the given colour.
   * 
   * @param {Number} color Unsigned 32 bit integer color value 
   * @returns {Function} the optimal render method for drawing
   */
  getOptimalRenderMethodForColor(color) {
    if ((color & 0xff) != 0xff) {
      return this.blendColor.bind(this);
    }
    return this.setColor.bind(this);
  }
}

