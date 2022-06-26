/**
 * @example new ImageData(width, height);
 * @example new ImageData(data, width);
 * @example new ImageData(data, width, height);
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/ImageData
 */
export default class ImageData {

  constructor(...args) {

    let arg, data, width, height;

    if (args.length < 2) {
      throw new TypeError('Not enough arguments');     
    }
  
    arg = args.shift();
    if (arg instanceof Uint8ClampedArray) {
      data = arg;
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

    this._height = height;
    this._width = width;
    this._data = data;
  }


  /**
   * The width of the image data, in pixels.
   * @type {Number}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/width
   */
  get width() {
    return this._width;
  }


  /**
   * The height of the image data, in pixels.
   * @type {Number}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/height
   */
  get height() {
    return this._height;
  }


  /**
   * An array of RBGA colour data.
   * @type Uint8ClampedArray
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data
   */
  get data() {
    return this._data;
  }


  get [Symbol.toStringTag]() {
    return 'ImageData';
  }
}
