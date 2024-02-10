import ImageData from 'imagedata';
import {
  ImageDataIndexedPaletteWriter,
  IndexedPalette, ContiguousBitplaneReader, createAtariStIndexedPalette
} from 'imagedata-coder-bitplane';

import { getPaletteColorOffset } from './common.js';
import {
  COLORS_PER_SCANLINE,
  ERROR_MESSAGE_INVALID_FILE_FORMAT,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  SPECTRUM_FILE_HEADER
} from './consts.js';


/**
 * Decompresses the palette.
 * 
 * Each 16 colour palette consists of a header word followed by the colour data.
 * The header word is a 16 bit mask where a `1` indicates the colour exists in
 * the colour data and `0` indicates the colour doesn't and should be treated as
 * black. 
 * 
 * @param {ArrayBuffer} buffer - The `ArrayBuffer` containing the compressed data
 * @returns {Uint8Array} - A `Uint8Array` containing the uncompressed palette data
 */
export const decompressPalette = (buffer, byteOffset, byteLength) => {
  const palette = new Uint8Array(COLORS_PER_SCANLINE * IMAGE_HEIGHT * 2);
  const paletteView = new DataView(palette.buffer);
  const srcView = new DataView(buffer, byteOffset, byteLength);

  let outPos = 0;
  let srcPos = 0;
  while (srcPos < srcView.byteLength) {
    let paletteMask = srcView.getUint16(srcPos);
    srcPos += 2;
    for (let c = 0; c < 16; c++) {
      if (paletteMask & 1) {
        paletteView.setUint16(outPos, srcView.getUint16(srcPos));
        srcPos += 2;
        outPos += 2;
      } else {
        paletteView.setUint16(outPos, 0);
        outPos += 2;
      }
      paletteMask >>= 1;
    }
  }

  return palette;
};


/**
* Decompresses SPC run-length encoded bitmap data.
* 
* @param {ArrayBuffer} buffer - The `ArrayBuffer` containing the compressed data
* @param {number} byteOffset - Offset into the buffer to the first image byte
* @param {number} byteLength - Length of the image to decompress
* @returns {Uint8Array} - A `ArrayBuffer` containing the uncompressed data
*/
export const decompressImage = (buffer, byteOffset, byteLength) => {
  const srcView = new DataView(buffer, byteOffset, byteLength);
  const outBuffer = new Uint8Array(IMAGE_HEIGHT * 160);
  const srcLength = srcView.byteLength - 1;

  let outPos = 0;
  let srcPos = 0;

  while (srcPos < srcLength) {
    const header = srcView.getInt8(srcPos++);
    if (header < 0) {
      const data = srcView.getUint8(srcPos++);
      for (let i = -header + 2; i > 0; i--) {
        outBuffer[outPos++] = data;
      }
    } else {
      for (let i = header + 1; i > 0; i--) {
        outBuffer[outPos++] = srcView.getUint8(srcPos++);
      }
    }
  }
  return outBuffer;
};


/**
 * Decodes a compressed Spectrum 512 image and returns a ImageData object
 * containing the converted data. Colors are converted from 12bit RGB to 32bit 
 * RGBA format.
 * 
 * @param {ArrayBuffer} buffer - An array buffer containing the image
 * @returns {Promise<DecodedImage>} Decoded image data
 * @throws {Error} If the image data is invalid
 */
export const decode = (buffer) => {

  const bufferView = new DataView(buffer);

  // Check the file header is valid
  if (bufferView.getUint32(0) !== SPECTRUM_FILE_HEADER) {
    throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
  }

  const bitmapLength = bufferView.getUint32(4);
  const paletteLength = bufferView.getUint32(8);
  const decompressedImageData = decompressImage(buffer, 12, bitmapLength);
  const decompressedPaletteData = decompressPalette(buffer, 12 + bitmapLength, paletteLength);
  const palette = createAtariStIndexedPalette(decompressedPaletteData, COLORS_PER_SCANLINE * IMAGE_HEIGHT);
  const imageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
  const reader = new ContiguousBitplaneReader(decompressedImageData, 4, IMAGE_WIDTH, IMAGE_HEIGHT);
  const writer = new ImageDataIndexedPaletteWriter(imageData, palette);

  for (let y = 0; y < IMAGE_HEIGHT; y++) {
    for (let x = 0; x < IMAGE_WIDTH; x++) {
      const color = reader.read();
      const mappedColor = getPaletteColorOffset(x, y, color);
      writer.write(mappedColor);
    }
  }

  const { bitsPerChannel } = palette;

  return {
    meta: {
      palette: new IndexedPalette(bitsPerChannel === 4 ? 4096 : 512, { bitsPerChannel }),
      compression: true
    },
    imageData
  };
};
