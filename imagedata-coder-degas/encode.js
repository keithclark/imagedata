import { writeAtariStIndexedPalette, encode as encodeBitplanes } from 'imagedata-coder-bitplane';
import { ENCODING_FORMAT_WORD, ENCODING_FORMAT_LINE } from 'imagedata-coder-bitplane';
import { pack } from 'imagedata-coder-bitplane/compression/packbits.js';

/**
 * @typedef {import('imagedata-coder-bitplane').IndexedPalette} IndexedPalette
 */

/**
 * Encodes a `ImageData` object into an Degas image
 * 
 * @param {ImageData} imageData - The image data to encide
 * @param {IndexedPalette} palette - The color palette to use
 * @param {{compress:boolean}} options - The encoding options
 * @returns {Promise<ArrayBuffer>} - The encoded Degas image bytes
 */
export const encode = async (imageData, palette, options = {}) => {
  const { compress = false } = options;
  const buffer = new ArrayBuffer(32034);
  const dataView = new DataView(buffer);
  const paletteData = new Uint8Array(buffer, 2, 32);
  const bitplaneData = new Uint8Array(buffer, 34, 32000);
  const { height, width } = imageData;
  let res;
  let colors;

  if (width === 320 && height === 200) {
    res = 0;
    colors = 16;
  } else if (width === 640 && height === 200) {
    res = 1;
    colors = 4;
  } else if (width === 640 && height === 400) {
    res = 2;
    colors = 2;
  } else {
    throw new Error('Degas images must be 320x200, 640x200 or 640x400');
  }

  // compression
  dataView.setUint8(0, compress ? 0x80 : 0);     
  
  // resolution
  dataView.setUint8(1, res);

  // palette
  if (palette.length > colors) {
    throw new Error('Too many colours');
  }
  writeAtariStIndexedPalette(paletteData, palette);

  // If the image isn't compressed we just encode the bitplanes and return the
  // buffer
  if (!compress) {
    await encodeBitplanes(imageData, bitplaneData, palette, { format: ENCODING_FORMAT_WORD });
    return buffer;  
  }

  // The image is compressed. When decompressing, Degas Elite uses a buffer 
  // that's sized to the length of a scanline.  To ensure we don't cause bus 
  // errors when decompressing this image, we must compress each scanline 
  // one-by-one rather than letting the RLE work across scanlines.
  const uncompressedData = new Uint8Array(32000);
  const planeLength = [40, 80, 80][res];
  const planes = [4, 2, 1][res];

  // some lines may turn out larger than the original after compression so
  // esure the buffer is big enough
  const packedLineBuffer = new Uint8Array(planeLength * 2);

  let pos = 0;

  // Encode the ImageData into compressed bitplane data. Note that degas uses
  // line interleaved encoding when compressing data
  await encodeBitplanes(imageData, uncompressedData, palette, { format: ENCODING_FORMAT_LINE });

  for (let planeLine = 0; planeLine < height * planes; planeLine++) {
    const line = uncompressedData.slice(planeLine * planeLength, planeLine * planeLength + planeLength);
    const packedLength = pack(line, packedLineBuffer);
    bitplaneData.set(packedLineBuffer, pos);
    pos += packedLength;
  }

  return buffer.slice(0, bitplaneData.byteOffset + pos);

};
