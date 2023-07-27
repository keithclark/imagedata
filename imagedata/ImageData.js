/**
 * An implementation of the W3C ImageData interface for use in JavaScript 
 * environments that don't support it natively (everything other than a web 
 * browser)
 *
 * @module keithclark/imagedata
 * @see https://html.spec.whatwg.org/multipage/canvas.html#imagedata
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/ImageData
 */
export default class ImageData {

  #width;
  #height;
  #data;

  /**
   * Creates an ImageData object of a specific width and height filled with 
   * black pixels, or from an array of Uint8ClampedArray pixel data.
   * 
   * @param {Uint8ClampedArray} data Byte data representing the RGBA values of the image. Must be a multiple of 4.
   * @param {number} width The image width in pixels
   * @param {number} height The image height in pixels
   * @paramlist width, height
   * @paramlist data, width
   * @paramlist data, width, height
   */
  constructor(...args) {

    let arg, data, width, height;

    if (args.length < 2) {
      throw new TypeError('Not enough arguments');     
    }
  
    arg = args.shift();
    if (arg instanceof Uint8ClampedArray) {
      data = arg.slice();
      arg = args.shift();
    } else if (!Number.isInteger(arg)) {
      throw new TypeError('Argument 0 must be an Integer or Uint8ClampedArray');     
    }

    if (Number.isInteger(arg) && arg > 0) {
      width = arg;
    } else {
      throw new TypeError('Width must be an integer');
    }

    if (args.length) {
      arg = args.shift();
      if (Number.isInteger(arg) && arg > 0) {
        height = arg;
      } else {
        throw new TypeError('Height must be an integer');
      }
    }

    if (data) {
      let { length } = data;

      if (!length || length % 4) {
        throw new RangeError('Data length must be a non-zero multiple of 4');
      }

      length /= 4;
      if (length % width) {
        throw new RangeError('Data length must be a multiple of image width * 4');
      }

      length /= width;
      if (height) {
        if (length !== height) {
          throw new RangeError('Data length must be a multiple of image width * 4 * height');
        }
      } else {
        height = Math.ceil(length);
      }
    } else {
      data = new Uint8ClampedArray(width * height * 4);
    }

    this.#height = height;
    this.#width = width;
    this.#data = data;
  }


  /**
   * The width of the image data in pixels.
   * @type {number}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/width
   */
  get width() {
    return this.#width;
  }


  /**
   * The height of the image data in pixels.
   * @type {number}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/height
   */
  get height() {
    return this.#height;
  }


  /**
   * An array of color data representing the RGBA values of the image.
   * @type {Uint8ClampedArray}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data
   * @example
   * const { data } = myImageData;
   * const r = data[0];
   * const g = data[1];
   * const b = data[2];
   * const a = data[3];
   */
  get data() {
    return this.#data;
  }


  /**
   * The color space of the image data. This property exists for compatability 
   * reasons and always returns `srgb`.
   * @type {string}
   */
  get colorSpace() {
    return 'srgb';
  }


  get [Symbol.toStringTag]() {
    return 'ImageData';
  }

}
