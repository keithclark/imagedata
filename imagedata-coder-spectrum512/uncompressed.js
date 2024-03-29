import ImageData from 'imagedata';

import {
  ImageDataIndexedPaletteWriter,
  WordInterleavedBitplaneReader
} from 'imagedata-coder-bitplane';

import {
  createPaletteArray,
  getPaletteColorOffset
} from './common.js';

import {
  ERROR_MESSAGE_INVALID_FILE_FORMAT,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  SPECTRUM_UNCOMPRESSED_FILE_SIZE,
  COMPRESSION_METHOD_NONE
} from './consts.js';

/**
 * @typedef {import('./types.js').Spectrum512Image} Spectrum512Image
 */


/**
 * Decodes an uncompressed Spectrum 512 image and returns a ImageData object
 * containing the converted data. Colors are converted from 12bit RGB to 32bit
 * RGBA format.
 *
 * @param {ArrayBuffer} buffer - An array buffer containing the uncompressed image
 * @returns {Promise<Spectrum512Image>} A promise that resolves with the decoded image
 * @throws {Error} If the image data is invalid
 */
export const decode = (buffer) => {
  const imageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);

  if (buffer.byteLength !== SPECTRUM_UNCOMPRESSED_FILE_SIZE) {
    throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
  }

  const palettes = createPaletteArray(buffer, 32000);
  const reader = new WordInterleavedBitplaneReader(new Uint8Array(buffer, 160, 32000 - 160), 4);
  const writer = new ImageDataIndexedPaletteWriter(imageData, palettes[0]);

  for (let y = 0; y < IMAGE_HEIGHT; y++) {
    writer.setPalette(palettes[y]);
    for (let x = 0; x < IMAGE_WIDTH; x++) {
      const color = reader.read();
      const mappedColor = getPaletteColorOffset(x, 0, color);
      writer.write(mappedColor);
    }
  }

  return {
    meta: {
      palette: palettes,
      compression: COMPRESSION_METHOD_NONE
    },
    imageData
  };
};
