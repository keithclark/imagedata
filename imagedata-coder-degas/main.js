import { decode as decodeBitplanes, encode as encodeBitplanes } from 'imagedata-coder-bitplane';
import { depack } from 'imagedata-coder-bitplane/compression/packbits.js';
import { IndexedPalette } from 'imagedata-coder-bitplane';

const STE_4096_COLOR_BITMASK = 0b100010001000;

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
 * @returns {Promise<{palette: IndexedPalette,imageData: ImageData}>} Image data and palette for the image
 */
export const decode = async buffer => {
  const dataView = new DataView(buffer);
  const compressed = dataView.getUint8(0);
  const res = dataView.getUint8(1);

  let bitplaneData;
  let imageData;
  let bitsPerChannel = 3;

  if ((compressed !== 0x80 && compressed !== 0) || (res < 0 || res > 2)) {
    throw new Error('Invalid file format');
  }

  const width = res === 0 ? 320 : 640;
  const planes = 4 >> res;
  const colors = 1 << planes;

  // Determine if the palette is using the STe 4096 color format or not.
  for (let index = 0; index < colors; index++) {
    const color = dataView.getUint16(2 + index * 2);
    if (color & STE_4096_COLOR_BITMASK) {
      bitsPerChannel = 4;
      break;
    }
  }

  // Extract the palette
  const palette = new IndexedPalette(colors, { bitsPerChannel });
  for (let index = 0; index < colors; index++) {
    const color = dataView.getUint16(2 + index * 2);

    // Decode into R, G and B components
    let r = color >> 8 & 0xf;
    let g = color >> 4 & 0xf;
    let b = color >> 0 & 0xf;

    // For backwards compatability reasons, the Atari STe stores the least 
    // significant color bit for each channel in bit 4 (The standard ST only 
    // reads bits 1-3). If the palette is using all four bits the we need
    // reorder them before converting to 32 bit color.
    if (bitsPerChannel === 4) {
      r = ((r & 8) >>> 3) | (r << 1) & 0xf;
      g = ((g & 8) >>> 3) | (g << 1) & 0xf;
      b = ((b & 8) >>> 3) | (b << 1) & 0xf;     
    }

    // Set the indexed color in the palette
    palette.setColor(index, r, g, b);
  }

  // compressed images use packbits and are encoded line-by-line
  if (compressed) {
    bitplaneData = depack(buffer.slice(34), 32000);
    imageData = await decodeBitplanes(bitplaneData, palette, width, { format: 'line' });
  } else {
    bitplaneData = buffer.slice(34, 32034);
    imageData = await decodeBitplanes(bitplaneData, palette, width, { format: 'word' });
  }

  return {
    palette,
    imageData
  };
};


/**
 * Encodes a `ImageData` object into an Degas image
 * 
 * @param {ImageData} imageData - The image data to encode
 * @param {IndexedPalette} palette - The color palette to use
 * @param {Boolean} steColor - If true, encode the color channels as 4 bit. Otherwise, 3 bits is used
 * @param {Boolean} compress - If true, the image data is compressed
 * @returns {Promise<ArrayBuffer>} - The encoded Degas image bytes
 */
export const encode = async (imageData, palette, steColor = false, compress = false) => {
  const buffer = new ArrayBuffer(32034);
  const uint8View = new Uint8Array(buffer);
  const dataView = new DataView(buffer);
  let res;

  if (imageData.width === 320 && imageData.height === 200) {
    res = 0;
  } else if (imageData.width === 640 && imageData.height === 200) {
    res = 1;
  } else if (imageData.width === 640 && imageData.height === 400) {
    res = 2;
  } else {
    throw new Error('Degas images must be 320x200, 640x200 or 640x400');
  }

  // compression
  dataView.setUint8(0, compress ? 1 : 0);     
  
  // resolution
  dataView.setUint8(1, res);

  // Degas colours are always stored rrrr,gggg,bbbb - even if the colour is only
  // 3 bits per channel.
  let colors;
  if (!steColor) {
    // Standard ST palette is 3 bits per channel stored over 4 bits: 0rrr0ggg0bbb
    colors = palette.resample(3).toValueArray(4, false);
    for (let index = 0; index < colors.length; index++) {
      dataView.setUint16(2 + index * 2, colors[index]);
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
      dataView.setUint16(2 + index * 2, steColor);
    }
  }

  // Encode the bitplanes
  if (compress) {
    throw 'Compression not implemented';
    //imageData = await decodeBitplanes(bitplaneData, palette, width, { format: 'line' });
    //bitplaneData = pack(imageData);
  } else {
    const planeData = await encodeBitplanes(imageData, palette, { format: 'word' });
    uint8View.set(new Uint8Array(planeData), 34);
  }

  return buffer;
};
