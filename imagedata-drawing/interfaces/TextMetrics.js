export default class TextMetrics {

  #ascent;
  #descent;
  #left;
  #right;

  /**
   * @param {Number} ascent - Number of pixels above the baseline
   * @param {Number} descent - Number of pixels below the baseline
   * @param {Number} left - The left most value. Usually 0.
   * @param {Number} right - The right most value.
   */
  constructor(ascent, descent, left, right) {
    this.#ascent = ascent;
    this.#descent = descent;
    this.#left = left;
    this.#right = right;
  }

  /** 
   * The distance from the text baseline to the uppermost pixel
   *  
   * @type {Number} 
   */
  get actualBoundingBoxAscent() {
    return this.#ascent;
  }

  /** 
   * The distance from the text baseline to the lowermost pixel
   *  
   * @type {Number} 
   */
  get actualBoundingBoxDescent() {
    return this.#descent;
  }

  /** 
   * The distance to the leftmost pixel
   *  
   * @type {Number} 
   */
  get actualBoundingBoxLeft() {
    return this.#left;
  }

  /** 
   * The distance to the rightmost pixel
   *  
   * @type {Number} 
   */
  get actualBoundingBoxRight() {
    return this.#right;
  }  
  
  /**
   * The width of the text in pixels
   * 
   * @type {Number}
   */
  get width() {
    return this.#right - this.#left;
  }

}
