import IndexedPalette from './lib/IndexedPalette.js';

/**
 * @typedef Color
 * @property {number} r The red channel intensity 
 * @property {number} g The green channel intensity 
 * @property {number} b The blue channel intensity 
*/


/**
 * Parses a 4-bit color into a Color object
 * @param {number} value - A 16-bit bit color value in Big Endian format.
 * @returns {Color} The parsed color
 */
export const parse4bitRgbColor = (value) => {
  return {
    r: (value >> 8) & 0xf,
    g: (value >> 4) & 0xf,
    b: (value) & 0xf
  };
};


/**
 * Parses a STE 4-bit color into a Color object
 * @param {number} value - A 16-bit bit color value in Big Endian format.
 * @returns {Color} The parsed color
 */
export const parseAtariSteColor = (value) => {
  const { r, g, b } = parse4bitRgbColor(value);
  return {
    r: ((r & 8) >>> 3) | (r << 1) & 0xf,
    g: ((g & 8) >>> 3) | (g << 1) & 0xf,
    b: ((b & 8) >>> 3) | (b << 1) & 0xf 
  };
};


export const createAtariSteIndexedPalette = (buffer, colors) => {  
  const palette = new IndexedPalette(colors, { bitsPerChannel: 4 });
  for (let c = 0; c < colors; c++) {
    const word = (buffer[c * 2] << 8) + buffer[c * 2 + 1];
    const { r, g, b } = parseAtariSteColor(word);
    palette.setColor(c, r, g, b);
  }
  return palette;
};


/**
 * Creates an index palette from a buffer of Atari ST or STe colors stored in 
 * either 3 or 4 bits per channel format.
 * 
 * @param {Uint8Array} buffer - An array containing the palette bytes
 * @param {number} colors - Number of colors in the palette
 * @returns {IndexedPalette} The parsed color palette.
 */
export const createAtariStIndexedPalette = (buffer, colors) => {  
  const palette = new IndexedPalette(colors, { bitsPerChannel: 3 });
  for (let c = 0; c < colors; c++) {
    const word = (buffer[c * 2] << 8) + buffer[c * 2 + 1];
    const { r, g, b } = parse4bitRgbColor(word);
    if ((r & 8) || (g & 8) || (b & 8)) {
      return createAtariSteIndexedPalette(buffer, colors);
    }
    palette.setColor(c, r, g, b);
  }
  return palette;
};


export const writeAtariStIndexedPalette = (buffer, palette) => {
  if (palette.bitsPerChannel === 3) {
    for (let c = 0; c < palette.length; c++) {
      const { r, g, b } = palette.getColor(c);
      buffer[c * 2] = r;
      buffer[c * 2 + 1] = (g << 4) + b;
    }
  } else if (palette.bitsPerChannel === 4) {
    for (let c = 0; c < palette.length; c++) {
      const { r, g, b } = palette.getColor(c);
      const steR = (r << 3 & 0x8) | (r >> 1 & 0x7);
      const steG = (g << 3 & 0x8) | (g >> 1 & 0x7);
      const steB = (b << 3 & 0x8) | (b >> 1 & 0x7);
      buffer[c * 2] = steR;
      buffer[c * 2 + 1] = (steG << 4) + steB;
    }
  } else {
    throw new Error('Atari ST palettes must be either 3 or 4 bit per channel');
  }
};
