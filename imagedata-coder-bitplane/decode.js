import ContiguousBitplaneReader from './lib/ContiguousBitplaneReader.js';
import LineInterleavedBitplaneReader from './lib/LineInterleavedBitplaneReader.js';
import WordInterleavedBitplaneReader from './lib/WordInterleavedBitplaneReader.js';
import ImageDataIndexedPaletteWriter from './lib/ImageDataIndexedPaletteWriter.js';

import {
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_WORD,
  ENCODING_FORMAT_LINE
} from './consts.js';

/**
 * Decodes bitplane data into ImageData
 *
 * @param {Uint8Array} buffer - An array buffer containing the bitmap data
 * @param {ImageData} imageData - The `ImageData` object to decode data to
 * @param {IndexedPalette} palette - The image palette
 * @param {import('./types.js').BitplaneEncodingOptions} options - Decoder options
 * @returns {Promise<ImageData>} An array containing bitplane encoded data
 */
export const decode = (buffer, imageData, palette, options = {}) => new Promise((resolve) => {

  let planes;

  // Ensure the image width is a multiple of 16 pixels  
  if (imageData.width % 16 !== 0) {
    throw new Error('ImageData width must be multiple of 16');
  }

  if ('planes' in options) {
    planes = options.planes;
  } else {
    // Ensure the palette contains enough entries to decode the number of planes
    planes = Math.log(palette.length) / Math.log(2);
  }

  if (!Number.isInteger(planes)) {
    throw new Error('Palette length must be a power of 2');
  }

  planes |= 0; // performance
  let reader;

  const { width, height } = imageData;
  const { format = ENCODING_FORMAT_WORD } = options;
  const writer = new ImageDataIndexedPaletteWriter(imageData, palette);

  if (format === ENCODING_FORMAT_CONTIGUOUS) { 
    reader = new ContiguousBitplaneReader(buffer, planes, width, height);
  } else if (format === ENCODING_FORMAT_LINE) { 
    reader = new LineInterleavedBitplaneReader(buffer, planes, width);
  } else if (format === ENCODING_FORMAT_WORD) { 
    reader = new WordInterleavedBitplaneReader(buffer, planes);
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

  resolve(imageData);
});
