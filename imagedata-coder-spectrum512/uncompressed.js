import ImageData from 'imagedata';

import {
  ImageDataIndexedPaletteWriter,
  IndexedPalette, WordInterleavedBitplaneReader, createAtariStIndexedPalette
} from 'imagedata-coder-bitplane';

import {
  getPaletteColorOffset
} from './common.js';

import {
  ERROR_MESSAGE_INVALID_FILE_FORMAT,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  COLORS_PER_SCANLINE,
  SPECTRUM_UNCOMPRESSED_FILE_SIZE
} from './consts.js';

/**
 * @typedef {import('./types.js').DecodedImage} DecodedImage
 */


/**
 * Decodes a Spectrum 512 image and returns a ImageData object containing the
 * converted data. Colors are converted from 12bit RGB to 32bit RGBA format
 *
 * @param {ArrayBuffer} buffer - An array buffer containing the NEOChrome image
 * @returns {Promise<DecodedImage>} Decoded image data
 * @throws {Error} If the image data is invalid
 */
export const decode = (buffer) => {
  const imageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);

  if (buffer.byteLength !== SPECTRUM_UNCOMPRESSED_FILE_SIZE) {
    throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
  }

  const palette = createAtariStIndexedPalette(new Uint8Array(buffer.slice(32000)), COLORS_PER_SCANLINE * IMAGE_HEIGHT);
  const { bitsPerChannel } = palette;
  const reader = new WordInterleavedBitplaneReader(new Uint8Array(buffer, 160, 32000 - 160), 4);
  const writer = new ImageDataIndexedPaletteWriter(imageData, palette);

  for (let y = 0; y < IMAGE_HEIGHT; y++) {
    for (let x = 0; x < IMAGE_WIDTH; x++) {
      const color = reader.read();
      const mappedColor = getPaletteColorOffset(x, y, color);
      writer.write(mappedColor);
    }
  }

  return {
    palette: new IndexedPalette(bitsPerChannel === 4 ? 4096 : 512, { bitsPerChannel }),
    imageData
  };
};
