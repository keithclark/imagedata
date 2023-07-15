/**
 * @typedef {Object} Glpyh
 * @property {Number} vOffset - The vertical offset of the glyph
 * @property {Number} width - The width of the glyph
 * @property {Array<Number>} data - The binary data for each row of the glyph
 */

const EMPTY_GLYPH = Object.freeze({
  width: 7,
  data: [
    0b0001000,
    0b0010100,
    0b0110110,
    0b1110111,
    0b0111110,
    0b0010100,
    0b0001000
  ]
});

/**
 * An object that represents a font
 */
export default class Font {

  /**
   * @param {Object} config 
   */
  constructor(config) {
    this.glyphs = config.glyphs || {};
    this.baseHeight = config.baseHeight;
  }


  /**
   * Returns the graphical representation of a singe character from the font. If
   * the character doesn't exist in the font then a error placeholder is 
   * returned.
   * 
   * @param {String} char the character to return the glyph of
   * @returns {Glpyh} the glyph
   */
  getGlyph(char) {
    if (!this.glyphs[char]) {
      return EMPTY_GLYPH;
    }
    return this.glyphs[char];
  }

}
