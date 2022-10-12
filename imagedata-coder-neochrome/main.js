import { decode as decodeBitplanes, encode as encodeBitplanes } from 'imagedata-bitplane-coder';
import { IndexedPalette } from 'imagedata-bitplane-coder';

const STE_4096_COLOR_BITMASK = 0b100010001000;

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
  let bitsPerChannel = 3;

  const dataView = new DataView(buffer);

  // Determine if the palette is using the STe 4096 color format or not.
  for (let index = 0; index < 16; index++) {
    const color = dataView.getUint16(4 + index * 2);
    if (color & STE_4096_COLOR_BITMASK) {
      bitsPerChannel = 4;
      break;
    }
  }

  // Extract the palette
  const palette = new IndexedPalette(16, { bitsPerChannel });
  for (let index = 0; index < 16; index++) {
    const color = dataView.getUint16(4 + index * 2);

    // Decode into R, G and B components
    let r = color >> 8 & 0xf;
    let g = color >> 4 & 0xf;
    let b = color >> 0 & 0xf;

    // For backwards compatability reasons, the Atari STe stores the least 
    // significant color bit for each channel in bit 4 (The ST only reads bits 
    // 1-3). If the palette is using all four bits we need reorder them.
    if (bitsPerChannel === 4) {
      r = ((r & 8) >>> 3) | (r << 1) & 0xf;
      g = ((g & 8) >>> 3) | (g << 1) & 0xf;
      b = ((b & 8) >>> 3) | (b << 1) & 0xf;     
    }

    // Set the indexed color in the palette
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
 * @param {Boolean} steColor - If true, encode the color channels as 4 bit. Otherwise, 3 bits is used
 * @returns {Promise<ArrayBuffer>} - The encoded NEOchrome image bytes
 */
export const encode = async (imageData, palette, steColor = false) => {
  const buffer = new ArrayBuffer(32128);
  const dataView = new DataView(buffer);
  const uint8View = new Uint8Array(buffer);

  if (imageData.width !== 320 || imageData.height !== 200 || palette.length !== 16) {
    throw new Error('NEOchrome images must be 320x200, 16 color');
  }

  // NEO colours are always stored rrrr,gggg,bbbb - even if the colour is only
  // 3 bits per channel.
  let colors;
  if (!steColor) {
    // Standard ST palette is 3 bits per channel stored over 4 bits: 0rrr0ggg0bbb
    colors = palette.resample(3).toValueArray(4, false);
    for (let index = 0; index < colors.length; index++) {
      dataView.setUint16(4 + index * 2, colors[index]);
    }
  } else {
    // Enhanced ST palette is 4 bits: rrrrggggbbbb but LSB is stored in bit 4 so
    // colours still render on a standard ST.
    colors = palette.resample(4).toValueArray(4, false);
    for (let index = 0; index < colors.length; index++) {
      let color = colors[index];

      // Decode into R, G and B components
      const r = color >> 8 & 0xf;
      const g = color >> 4 & 0xf;
      const b = color >> 0 & 0xf;

      // Rotate the bits so LSB becomes MSB
      const steR = (r >> 1) + ((r & 1) << 3);
      const steG = (g >> 1) + ((g & 1) << 3);
      const steB = (b >> 1) + ((b & 1) << 3);
      const steColor = (steR << 8) + (steG << 4) + steB;
      dataView.setUint16(4 + index * 2, steColor);
    }
  }

  // Encode the bitplanes
  const planeData = await encodeBitplanes(imageData, palette, { format: 'word' });
  uint8View.set(new Uint8Array(planeData), 128);
  
  return buffer;
};
