import ImageData from 'imagedata';
import {
  createAtariStIndexedPalette,
  ENCODING_FORMAT_WORD,
  decode as decodeBitplanes
} from 'imagedata-coder-bitplane';


/**
 * @typedef {Object} DecodedNeoImage
 * @property {IndexedPalette} palette - The indexed palette containing the image colors
 * @property {ImageData} imageData - The ImageData object containing the image
 */

/**
 * Decodes a NEOchrome image and returns a ImageData object containing the
 * converted data. Colors are converted from 12bit RGB to 32bit RGBA format
 *
 * NEOchrome images are always 320 x 200, 4 plane images with word interleaved
 * bitplanes.
 *
 * @param {ArrayBuffer} buffer - An array buffer containing the NEOChrome image
 * @returns {Promise<DecodedNeoImage>} Decoded image data
 */
export const decode = async (buffer) => {
  const paletteData = new Uint8Array(buffer, 4, 32);
  const bitplaneData = new Uint8Array(buffer, 128, 32000);
  const palette = createAtariStIndexedPalette(paletteData, 16);
  const imageData = new ImageData(320, 200);
  await decodeBitplanes(bitplaneData, imageData, palette, { format: ENCODING_FORMAT_WORD });
  return {
    imageData,
    palette
  };
};
