import TextMetrics from '../interfaces/TextMetrics.js';

/**
 * @typedef {import('./fontRegistry.js').Font} Font
 * @typedef {import('./fontRegistry.js').Glpyh} Glpyh
 * @typedef {import('../interfaces/PixelView.js').default} PixelView
 */

/**
 * Renders a string of characters using a PixelView
 * 
 * @param {PixelView} pixelView - The PixelView to use to render with
 * @param {String} text - The text string to render
 * @param {Number} x - The y-axis coordinate to render the text at
 * @param {Number} y - The y-axis coordinate to render the text at
 * @param {Number} color - The color to render the text in
 * @param {Font} font - The font to render the text in
 * @returns 
 */
export const drawText = (pixelView, text, x, y, color = 0xfffffff, font) => {
  if (!font) {
    return;
  }
  const chars = ('' + text);
  const setPixel = pixelView.getOptimalRenderMethodForColor(color);

  for (let char of chars) {

    const { vOffset = 0, width, data } = getFontGlyph(char, font);
    const { length: height } = data;

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (data[row] >> (width - col - 1) & 1) {
          setPixel(x + col, y + row - font.baseHeight + vOffset, color);
        }
      }
    }
    x += width + 1;
  }
};


/**
 * Measures a string of text when rendered with a font and returns a 
 * `TextMetrics` instance containing the details.
 * 
 * @param {String} text - The string of text to measure
 * @param {Font} font - The font to use
 * @returns {TextMetrics} The text metrics for the string
 */
export const getTextMetrics = (text, font) => {
  if (!font) {
    return new TextMetrics(0, 0, 0, 0);
  }
  const chars = ('' + text);
  let width = 0;
  let top = 0;
  let bottom = 0;

  for (let char of chars) {
    const glyph = getFontGlyph(char, font);
    const glyphHeight =  glyph.data.length;
    const { vOffset = 0 } = glyph;
    width += glyph.width + 1;
    top = Math.min(top, vOffset);
    bottom = Math.max(bottom, vOffset + (glyphHeight - font.baseHeight));
  }

  if (width > 0) {
    width--;
  }

  return new TextMetrics(
    -top + font.baseHeight,
    bottom,
    0,
    width
  );
};


/**
 * Returns a single glyph for a character
 * 
 * @param {String} char - The character to render
 * @param {Font} font - The font to use
 * @returns {Glpyh} The character glyph
 */
const getFontGlyph = (char, font) => {
  if (!font.glpyhs[char]) {
    char = 'none';
  }
  return font.glpyhs[char];
};
