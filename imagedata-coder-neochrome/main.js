import { decode as decodeBitplanes, encode as encodeBitplanes } from 'imagedata-bitplane-coder';
import { IndexedPalette } from 'imagedata-bitplane-coder';

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
export const decode = async buffer => {
  const dataView = new DataView(buffer);

  // Extract the palette
  const palette = new IndexedPalette(16, { bitsPerChannel: 3 });
  for (let index = 0; index < palette.length; index++) {
    const color = dataView.getUint16(4 + index * 2);
    const r = color >> 8 & 0xf;
    const g = color >> 4 & 0xf;
    const b = color >> 0 & 0xf;
    palette.setColor(index, r, g, b);
  }

  // Extract the bitplanes
  const bitplaneData = buffer.slice(128, 32128);

  // Decode the bitplanes, returning ImageData
  const imageData = await decodeBitplanes(bitplaneData, palette, 320, { format: 'word' });

  return { palette, imageData };
};


/**
 * Encodes a `ImageData` object into an NEOchrome image
 * 
 * @param {ImageData} imageData - The image data to encide
 * @param {IndexedPalette} palette - The color palette to use
 * @returns {Promise<ArrayBuffer>} - The encoded NEOchrome image bytes
 */
export const encode = async (imageData, palette) => {
  const buffer = new ArrayBuffer(32128);
  const dataView = new DataView(buffer);
  const uint8View = new Uint8Array(buffer);

  if (imageData.width !== 320 || imageData.height !== 200 || palette.length !== 16) {
    throw new Error('NEOchrome images must be 320x200, 16 color');
  }

  // NEO colours are always stored rrrr,gggg,bbbb - even if the colour is only
  // 3 bits per channel.
  const colors = palette.resample(3).toValueArray(4, false);

  // Encode the palette
  for (let index = 0; index < colors.length; index++) {
    dataView.setUint16(4 + index * 2, colors[index]);
  }

  // Encode the bitplanes
  const planeData = await encodeBitplanes(imageData, palette, { format: 'word' });
  uint8View.set(new Uint8Array(planeData), 128);
  
  return buffer;
};
