export default class Rect {

  #x;
  #y;
  #width;
  #height;

  /**
   * @param {Number} x - The x coordinate of the rectangle.
   * @param {Number} y - The y coordinate of the rectangle.
   * @param {Number} width - The width of the rectangle. Can be negative.
   * @param {Number} height - The height of the rectangle  Can be negative.
   */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
  }

  /**
   * The y-axis value representing the top edge of the bounding box in CSS 
   * pixels. Value can be less than `y` if `height` is a negative.
   * @type {Number}
   */
  get top() {
    if (this.#height < 0) {
      return this.#y + this.#height;
    }
    return this.#y;
  }

  /**
   * The y-axis value representing the bottom edge of the bounding box in CSS 
   * pixels.
   * @type {Number}
   */
  get bottom() {
    if (this.#height < 0) {
      return this.#y;
    }
    return this.#y + this.#height;
  }

  /**
   * The x-axis value representing the left edge of the bounding box in CSS 
   * pixels. Value can be less than `x` if `width` is a negative.
   * @type {Number}
   */
  get left() {
    if (this.#width < 0) {
      return this.#x + this.#width;
    }
    return this.#x;
  }

  /**
   * The x-axis value representing the right edge of the bounding box in CSS 
   * pixels
   * @type {Number}
   */
  get right() {
    if (this.#width < 0) {
      return this.#x;
    }
    return this.#x + this.#width;
  }

  /**
   * The value representing the horizontal component of the top-left corner of 
   * the bounding box in CSS pixels along the y-axis.
   * @type {Number}
   */
  get x() {
    return this.#x;
  }

  /**
   * The value representing the vertical component of the top-left corner of 
   * the bounding box in CSS pixels along the y-axis.
   * @type {Number}
   */
  get y() {
    return this.#y;
  }

  /**
   * The value representing the width component of the bounding box in CSS 
   * pixels. Value can be negative.
   * @type {Number}
   */
  get width() {
    return this.#width;
  }

  /**
   * The value representing the height component of the bounding box in CSS 
   * pixels. Value can be negative.
   * @type {Number}
   */
  get height() {
    return this.#height;
  }

}
