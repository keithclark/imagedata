import ImageData from 'imagedata';
import { ENCODING_FORMAT_WORD, IndexedPalette, createAtariStIndexedPalette, decode as decodeBitplanes } from 'imagedata-coder-bitplane';
import { decompress } from './compression.js';
import { ERROR_MESSAGE_INVALID_FILE_FORMAT, FILE_HEADER } from './consts.js';

/**
 * @typedef CrackArtImageMetadata
 * @property {IndexedPalette} palette The color palette for the image
 * @property {boolean} compressed Is the image data compressed
 */

/**
 * @typedef CrackArtImage
 * @property {ImageData} imageData - The decoded image data
 * @property {CrackArtImageMetadata} meta - The image metadata
 */

/**
 * Decodes a Crack Art image and returns a ImageData object containing the
 * converted data. Colors are converted from 12bit RGB to 32bit RGBA format.
 * Supports CA1, CA2 and CA3 formats.
 *
 * @param {ArrayBuffer} buffer - An array buffer containing the Crack Art image
 * @returns {Promise<CrackArtImage>} Decoded image data
 * @throws {Error} If the image data is invalid
 */
export const decode = async (buffer) => {
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
    palette.setColor(0, 1, 1, 1);
    palette.setColor(1, 0, 0, 0);
  } else {
    if (res === 0) {
      palette = createAtariStIndexedPalette(new Uint8Array(buffer, 4, 32), 16);
    } else {
      palette = createAtariStIndexedPalette(new Uint8Array(buffer, 4, 8), 4);
    }
    pos += palette.length * 2;
  }

  const width = res === 0 ? 320 : 640;
  const height = res === 2 ? 400 : 200;
  let bitplaneData = buffer.slice(pos);

  const imageData = new ImageData(width, height);
  if (compressed) {
    bitplaneData = decompress(bitplaneData);
  }

  await decodeBitplanes(new Uint8Array(bitplaneData), imageData, palette, { format: ENCODING_FORMAT_WORD });

  return {
    imageData,
    meta: {
      palette,
      compressed: !!compressed
    }
  };

};
