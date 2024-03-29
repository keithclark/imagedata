import { createAtariStIndexedPalette } from 'imagedata-coder-bitplane';
import { COLORS_PER_SCANLINE, IMAGE_HEIGHT } from "./consts.js";

/**
 * 
 * @param {Number} x - X pixel
 * @param {Number} y - Y pixel
 * @param {Number} c - Colour index
 * @returns {Number} the index into the palette
 */
export const getPaletteColorOffset = (x, y, c) => {
  let x1 = 10 * c;

  if (c % 2) {
    x1 -= 5;
  } else {
    x1 += 1;
  }
  if (x >= x1 && x < x1 + 160) {
    c += 16;
  } else if (x >= x1 + 160) {
    c += 32;
  }
  return c + (y * 48);
};


/**
 * Creates an array of IndexPalette objects from a buffer of RGB values.
 * 
 * @param {ArrayBuffer} buffer Buffer containing the palette entries
 * @param {number} [offset=0] Optional offset to the first byte of palette data
 * @returns {Array<IndexedPalette>} An array containing the color palettes of each line of the image
 */
export const createPaletteArray = (buffer, offset = 0) => {
  const palettes = [];
  // Extract the 199 palettes (48 colours)
  for (let c = 0; c < IMAGE_HEIGHT; c++) {
    const paletteBuffer = new Uint8Array(buffer, offset, COLORS_PER_SCANLINE * 2);
    palettes.push(createAtariStIndexedPalette(paletteBuffer, COLORS_PER_SCANLINE));
    offset += COLORS_PER_SCANLINE * 2;
  }
  return palettes;
}
