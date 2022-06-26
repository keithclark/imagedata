import { decode as decodeBitplanes, encode as encodeBitplanes } from 'imagedata-bitplane-coder';
import { depack } from 'imagedata-bitplane-coder/compression/packbits.js';
import { IndexedPalette } from 'imagedata-bitplane-coder';
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
  if ((compressed !== 0x80 && compressed !== 0) || (res < 0 || res > 2)) {
    throw new Error('Invalid file format');
  }

  const width = res === 0 ? 320 : 640;
  const planes = 4 >> res;

  // Extract the palette
  const palette = new IndexedPalette(1 << planes, { bitsPerChannel: 3 });
  for (let index = 0; index < palette.length; index++) {
    const color = dataView.getUint16(2 + index * 2);
    const r = color >> 8 & 0xf;
    const g = color >> 4 & 0xf;
    const b = color >> 0 & 0xf;
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
 * @returns {Promise<ArrayBuffer>} - The encoded Degas image bytes
 */
export const encode = async (imageData, palette, compress = false) => {
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
  const colors = palette.resample(3).toValueArray(4, false);

  // Encode the palette
  for (let index = 0; index < colors.length; index++) {
    dataView.setUint16(2 + index * 2, colors[index]);
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
