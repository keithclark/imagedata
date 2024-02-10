import { ENCODING_FORMAT_LINE, ENCODING_FORMAT_WORD, decode as decodeBitplanes } from 'imagedata-coder-bitplane';
import { depack } from 'imagedata-coder-bitplane/compression/packbits.js';
import { createAtariStIndexedPalette } from 'imagedata-coder-bitplane';
import ImageData from 'imagedata';

/**
 * @typedef {import('imagedata-coder-bitplane').IndexedPalette} IndexedPalette
 */

/**
 * @typedef DegasImageMetadata
 * @property {IndexedPalette} palette The color palette for the image
 * @property {boolean} compressed Is the image data compressed
 */

/**
 * @typedef DegasImage
 * @property {ImageData} imageData - The decoded image data
 * @property {DegasImageMetadata} meta - The image metadata
 */

/**
 * Decodes a Degas image and generates a ImageData object containing the
 * converted data, along with the original image palette.
 *
 * Degas images are stored as word interleaved bitplanes in the following
 * formats (width x height x planes):
 * 
 * - 320 x 200 x 4
 * - 640 x 200 x 2
 * - 640 x 400 x 1
 *
 * @param {ArrayBuffer} buffer - An array buffer containing the image to decode
 * @returns {Promise<{imageData: ImageData, meta: DegasImageMetadata}>} Image data and palette for the image
 */

export const decode = async (buffer) => {
  const dataView = new DataView(buffer);
  const compressed = dataView.getUint8(0);
  const res = dataView.getUint8(1);

  if ((compressed !== 0x80 && compressed !== 0) || (res < 0 || res > 2)) {
    throw new Error('Invalid file format');
  }
  
  const width = res === 0 ? 320 : 640;
  const height = res === 2 ? 400 : 200;
  const planes = 4 >> res;
  const colors = 1 << planes;
  const palette = createAtariStIndexedPalette(new Uint8Array(buffer, 2, colors * 2), colors);
  const imageData = new ImageData(width, height);
  if (compressed) {
    const bitplaneData = new Uint8Array(depack(buffer.slice(34), 32000));
    await decodeBitplanes(bitplaneData, imageData, palette, { format: ENCODING_FORMAT_LINE });
  } else {
    const bitplaneData = new Uint8Array(buffer, 34, 32000);
    await decodeBitplanes(bitplaneData, imageData, palette, { format: ENCODING_FORMAT_WORD });
  }
  return {
    imageData,
    meta: { 
      palette,
      compression: compressed
    }
  };
};
