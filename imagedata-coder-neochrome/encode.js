import {
  writeAtariStIndexedPalette,
  ENCODING_FORMAT_WORD,
  encode as encodeBitplanes
} from 'imagedata-coder-bitplane';

/**
 * Encodes a `ImageData` object into an NEOchrome image
 * 
 * @param {ImageData} imageData - The image data to encide
 * @param {IndexedPalette} palette - The color palette to use
 * @returns {Promise<ArrayBuffer>} - The encoded NEOchrome image bytes
 */
export const encode = async (imageData, palette) => {
  if (imageData.width !== 320 || imageData.height !== 200 || palette.length !== 16) {
    throw new Error('NEOchrome images must be 320x200, 16 color');
  }
  const buffer = new ArrayBuffer(32128);
  const paletteData = new Uint8Array(buffer, 4, 32);
  const bitplaneData = new Uint8Array(buffer, 128, 32000);
  writeAtariStIndexedPalette(paletteData, palette);
  await encodeBitplanes(imageData, bitplaneData, palette, { format: ENCODING_FORMAT_WORD });
  return buffer;
};
