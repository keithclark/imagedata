import ImageData from 'imagedata';

import {
  IndexedPalette,
  decodeWordsToPaletteIndexes
} from 'imagedata-coder-bitplane';

import {
  createPalette,
  getPaletteColorOffset
} from './common.js';

import {
  ERROR_MESSAGE_INVALID_FILE_FORMAT,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
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
export const decode = buffer => {
  const imageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
  const imageDataView = new DataView(imageData.data.buffer);

  let srcPosition = 160;
  let destPosition = 0;

  if (buffer.byteLength !== SPECTRUM_UNCOMPRESSED_FILE_SIZE) {
    throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
  }

  const bitplaneView = new DataView(buffer, 0, 32000);
  const paletteView = new DataView(buffer, 32000);
  const { palette, bitsPerChannel } = createPalette(paletteView);

  for (let y = 0; y < IMAGE_HEIGHT; y++) {
    for (let c = 0; c < IMAGE_WIDTH / 16; c++) {
      const indexes = decodeWordsToPaletteIndexes(bitplaneView, srcPosition, 4, 1);
      for (let x = 0; x < indexes.length; x++) {
        const color = getPaletteColorOffset((c * 16) + x, y, indexes[x]);
        imageDataView.setUint32(destPosition, palette[color]);
        destPosition += 4;
      }
      srcPosition += 8;
    }
  }

  return {
    palette: new IndexedPalette(bitsPerChannel === 4 ? 4096 : 512, { bitsPerChannel }),
    imageData
  };
};
