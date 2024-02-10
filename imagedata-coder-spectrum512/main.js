import { decode as decodeUncompressed } from './uncompressed.js';
import { decode as decodeCompressed } from './compressed.js';
import { decode as decodeSmooshed } from './smooshed.js';
import {
  SPECTRUM_FILE_HEADER,
  SPECTRUM_UNCOMPRESSED_FILE_SIZE,
  ERROR_MESSAGE_INVALID_FILE_FORMAT
} from './consts.js';

/**
 * @typedef {import('./types.js').DecodedImage} DecodedImage
 */

/**
 * @typedef Spectrum512ImageMetadata
 * @property {IndexedPalette} palette The color palette for the image
 * @property {boolean} compressed Is the image data compressed
 */

/**
 * @typedef Spectrum512Image
 * @property {ImageData} imageData - The ImageData object containing the image
 * @property {Spectrum512ImageMetadata} meta - The indexed palette containing the image colors
 */


/**
 * Decodes a Spectrum 512 image and returns a ImageData object containing the 
 * converted data. Colors are converted from 12bit RGB to 32bit RGBA format.
 * Supports SPU, SPC and SPS variants of the format.
 * 
 * @param {ArrayBuffer} buffer - An array buffer containing the image
 * @returns {Promise<Spectrum512Image>} Decoded image data
 * @throws {Error} If the image data is invalid
 */
export const decode = async (buffer) => {
  const bufferView = new DataView(buffer);
  if (buffer.byteLength === SPECTRUM_UNCOMPRESSED_FILE_SIZE) {
    return decodeUncompressed(buffer);
  } else if (bufferView.getUint32(0) === SPECTRUM_FILE_HEADER) {
    try {
      return decodeCompressed(buffer);
    } catch (e) {
      try {
        return decodeSmooshed(buffer);
      } catch (e) {
        throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
      }
    }
  }
};
