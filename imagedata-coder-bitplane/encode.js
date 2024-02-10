import ContiguousBitplaneWriter from './lib/ContiguousBitplaneWriter.js';
import LineInterleavedBitplaneWriter from './lib/LineInterleavedBitplaneWriter.js';
import WordInterleavedBitplaneWriter from './lib/WordInterleavedBitplaneWriter.js';
import ImageDataIndexedPaletteReader from './lib/ImageDataIndexedPaletteReader.js';

import { 
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_LINE,
  ENCODING_FORMAT_WORD
} from './consts.js';

/**
 * Encodes image data into bitplane format
 *
 * @param {ImageData} imageData - The image to convert
 * @param {Uint8Array} buffer - The buffer to write encoded data to
 * @param {IndexedPalette} palette - The image palette
 * @param {import('./types.js').BitplaneEncodingOptions} options - Conversion options
 * @returns {Promise<ArrayBuffer>} An array containing bitplane encoded data
 */
export const encode = (imageData, buffer, palette, options = {}) => new Promise((resolve) => {
  let {
    planes,
    format = ENCODING_FORMAT_WORD
  } = options;

  // Ensure the image width is a multiple of 16 pixels
  if (imageData.width % 16 !== 0) {
    throw new Error('Image width must be a multiple of 16');
  }

  // If a planes count wasn't supplied then calculate the number of required
  // planes based on the palette size.
  if (!planes) {
    planes = Math.ceil(Math.log(palette.length) / Math.log(2));
  }

  const { width, height } = imageData;

  const reader = new ImageDataIndexedPaletteReader(imageData, palette);
  let writer;

  if (format === ENCODING_FORMAT_CONTIGUOUS) { 
    writer = new ContiguousBitplaneWriter(buffer, planes, width, height);
  } else if (format === ENCODING_FORMAT_LINE) { 
    writer = new LineInterleavedBitplaneWriter(buffer, planes, width);
  } else if (format === ENCODING_FORMAT_WORD) { 
    writer = new WordInterleavedBitplaneWriter(buffer, planes);
  } else {
    throw new Error('Invalid format');
  }

  // Be tollerant of oversized buffers and only read the number of pixels 
  // required to fill the destination image data.
  let bytesToRead = width * height;
  while (bytesToRead) {
    writer.write(reader.read());
    bytesToRead--;
  }

  resolve();
});
