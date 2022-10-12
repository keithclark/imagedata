import { IndexedPalette, decode as decodeBitplanes } from 'imagedata-coder-bitplane';
import { decompress } from './compression.js';
import { ERROR_MESSAGE_INVALID_FILE_FORMAT, FILE_HEADER } from './consts.js';

/**
 * @typedef {import('./types.js').DecodedImage} DecodedImage
 */


/**
 * Decodes a Crack Art image and returns a ImageData object containing the
 * converted data. Colors are converted from 12bit RGB to 32bit RGBA format.
 * Supports CA1, CA2 and CA3 formats.
 *
 * @param {ArrayBuffer} buffer - An array buffer containing the NEOChrome image
 * @returns {Promise<DecodedImage>} Decoded image data
 * @throws {Error} If the image data is invalid
 */
export const decode = async buffer => {
  const dataView = new DataView(buffer);

  if (dataView.getUint16(0) !== FILE_HEADER) {
    throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
  }

  const compressed = dataView.getUint8(2);
  const res = dataView.getUint8(3);

  if ((compressed !== 1 && compressed !== 0) || (res < 0 || res > 2)) {
    throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
  }

  let palette;
  let pos = 4;

  if (res === 2) {
    palette = new IndexedPalette(2, { bitsPerChannel: 1 });
    palette.setColor(0, 0, 0, 0);
    palette.setColor(1, 1, 1, 1);
  } else {
    if (res === 0) {
      palette = new IndexedPalette(16, { bitsPerChannel: 3 });
    } else {
      palette = new IndexedPalette(4, { bitsPerChannel: 3 });
    }

    for (let index = 0; index < palette.length; index++) {
      const color = dataView.getUint16(pos);

      // Decode into R, G and B components
      const r = color >> 8 & 0xf;
      const g = color >> 4 & 0xf;
      const b = color >> 0 & 0xf;

      // Set the indexed color in the palette
      palette.setColor(index, r, g, b);

      pos += 2;
    }
  }

  const width = res === 0 ? 320 : 640;
  let bitplaneData = buffer.slice(pos);

  if (compressed) {
    bitplaneData = decompress(bitplaneData);
  }

  const imageData = await decodeBitplanes(bitplaneData, palette, width, { format: 'word' });

  return {
    palette,
    imageData
  };

};
