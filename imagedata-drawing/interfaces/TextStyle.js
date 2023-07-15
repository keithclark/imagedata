export default class TextStyle {

  #wordSpacing = 0;
  #letterSpacing = 0;
  #font;

  /**
   * The font to render with
   * @type {Font} 
   */
  get font() {
    return this.#font;
  }

  set font(value) {
    this.#font = value;
  }

  /**
   * Spacing between letters
   * @type {Number} 
   */
  get letterSpacing() {
    return this.#letterSpacing;
  }

  set letterSpacing(value) {
    this.#letterSpacing = value;
  }

  /**
   * Spacing between words
   * 
   * @type {Number} 
   */
  get wordSpacing() {
    return this.#wordSpacing;
  }

  set wordSpacing(value) {
    this.#wordSpacing = value;
  }

}
