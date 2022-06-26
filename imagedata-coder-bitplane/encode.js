import { IndexedPalette } from './IndexedPalette.js';
import { 
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_LINE,
  ENCODING_FORMAT_WORD
} from './consts.js';

/**
 * Encodes image data into bitplane format
 *
 * @param {ImageData} imageData - The image to convert
 * @param {IndexedPalette} palette - The image palette
 * @param {import('./types.js').BitplaneEncodingOptions} options - Conversion options
 * @returns {Promise<ArrayBuffer>} An array containing bitplane encoded data
 */
export const encode = (imageData, palette, options = {}) => new Promise(resolve => {
  let {
    planes,
    format = ENCODING_FORMAT_WORD
  } = options;

  /**
   * The palette as an array of unsigned 32 bit integers
   * @type {Uint32Array}
   */
  let colors;

  // Ensure the image width is a multiple of 16 pixels
  if (imageData.width % 16 !== 0) {
    throw new Error('Image width must be a multiple of 16');
  }

  // If an indexed palette was passed in, resample it to 8 bits per channel so 
  // it can be used as a lookup table for the RGBA values stored in the image 
  // data.
  if (palette instanceof IndexedPalette) {
    if (palette.bitsPerChannel != 8) {
      palette = palette.resample(8);
    }
    colors = new Uint32Array(palette.toValueArray());
  } else {
    console.warn('Bitplane encoder support for Uint32Array palettes is deprecated. Use `IndexedPalette` instead');
    colors = palette;
  }

  // If a planes count wasn't supplied then calculate the number of required
  // planes based on the palette size.
  if (!planes) {
    planes = Math.ceil(Math.log(colors.length) / Math.log(2));
  }

  // Ensure the palette will fit in the number of planes
  if (colors.length - 1 > planes ** 2) {
    throw new RangeError(`Too many colors (${colors.length}) for a ${planes} plane image`);
  }

  const lineLength = imageData.width >> 4;
  const planeLength = lineLength * imageData.height;
  const buffer = new ArrayBuffer(planeLength * planes * 2, 0);
  const dataView = new DataView(buffer);
  const colorView = new DataView(imageData.data.buffer);
  const bitPlaneWords = new Uint16Array(planes).fill(0);

  for (let i = 0; i < imageData.data.length / 4; i++) {
    const color = colorView.getUint32(i * 4);
    const index = colors.indexOf(color);
    if (index === -1) {
      throw new RangeError(`color 0x${color.toString(16).padStart(8, '0')} does not exist in the palette`);
    }
    const wordOffset = i >> 4;
    const bitOffset = i & 15;
    for (let planeIndex = 0; planeIndex < planes; planeIndex++) {
      bitPlaneWords[planeIndex] |= (index >> planeIndex & 1) << (15 - bitOffset);

      if (bitOffset === 15) {
        let offset;
        if (format === ENCODING_FORMAT_CONTIGUOUS) {
          offset = ((planeLength * planeIndex) + wordOffset) * 2;
        } else if (format === ENCODING_FORMAT_WORD) {
          offset = (planeIndex + (wordOffset * planes)) * 2;
        } else if (format === ENCODING_FORMAT_LINE) {
          const line = Math.floor(i / imageData.width);
          offset = ((line * planes + planeIndex) * lineLength + wordOffset % lineLength) * 2;
        }
        dataView.setUint16(offset, bitPlaneWords[planeIndex]);
        bitPlaneWords[planeIndex] = 0;
      }
    }
  }

  resolve(buffer);
});

