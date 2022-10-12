/**
 * Generates a palette lookup table
 * 
 * @param {DataView} paletteView - A DataView of the buffer containing the palette
 * @returns {Array<Number>} Array of colours
 */
export const createPalette = (paletteView) => {
  const palette = new Array(48 * 199);
  let q = 0;
  let isSte = false;
  let scale = 255 / 15;
  for (let line = 0; line < 199; line++) {
    for (let c = 0; c < 48; c++) {
      const color = paletteView.getUint16(line * 2 * 48 + c * 2);
      let r = color >> 8 & 0xf;
      let g = color >> 4 & 0xf;
      let b = color >> 0 & 0xf;

      if (!isSte && (r > 7 | g > 7 | b > 7)) {
        isSte = true;
      }

      r = ((r & 8) >>> 3) | (r << 1) & 0xf;
      g = ((g & 8) >>> 3) | (g << 1) & 0xf;
      b = ((b & 8) >>> 3) | (b << 1) & 0xf;

      palette[q++] = ((scale * r) << 24) + ((scale * g) << 16) + ((scale * b) << 8) + 255 >>> 0;
    }
  }

  return {
    bitsPerChannel: isSte ? 4 : 3,
    palette
  };
};


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
