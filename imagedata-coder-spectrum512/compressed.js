import ImageData from 'imagedata';
import { IndexedPalette, decodeWordsToPaletteIndexes } from 'imagedata-coder-bitplane';
import { createPalette, getPaletteColorOffset } from './common.js';
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
 * the colour data and `0` indicates the colour isn't and should be treated as
 * black. 
 * 
 * @param {ArrayBuffer} buffer - The `ArrayBuffer` containing the compressed data
 * @returns {ArrayBuffer} - A `ArrayBuffer` containing the uncompressed data
 */
export const decompressPalette = (buffer) => {
  const palette = new ArrayBuffer(COLORS_PER_SCANLINE * IMAGE_HEIGHT * 2);
  const paletteView = new DataView(palette);
  const srcView = new DataView(buffer);
  let outPos = 0;
  let srcPos = 0;
  while (srcPos < buffer.byteLength) {
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
* @returns {ArrayBuffer} - A `ArrayBuffer` containing the uncompressed data
*/
export const decompressImage = (buffer) => {
  const srcView = new DataView(buffer);
  const outBuffer = new ArrayBuffer(IMAGE_HEIGHT * 160);
  const outView = new DataView(outBuffer);
  const srcLength = srcView.byteLength - 1;

  let outPos = 0;
  let srcPos = 0;

  while (srcPos < srcLength) {
    const header = srcView.getInt8(srcPos++);
    if (header < 0) {
      const data = srcView.getUint8(srcPos++);
      for (let i = -header + 2; i > 0; i--) {
        outView.setUint8(outPos++, data);
      }
    } else {
      for (let i = header + 1; i > 0; i--) {
        outView.setUint8(outPos++, srcView.getUint8(srcPos++));
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
export const decode = buffer => {
  const imageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
  const imageDataView = new DataView(imageData.data.buffer);
  const bufferView = new DataView(buffer);

  let srcPosition = 0;
  let destPosition = 0;

  // Check the file header is valid
  if (bufferView.getUint32(0) !== SPECTRUM_FILE_HEADER) {
    throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
  }

  const bitmapLength = bufferView.getUint32(4);
  const paletteLength = bufferView.getUint32(8);
  const decompressedImageData = decompressImage(buffer.slice(12, 12 + bitmapLength));
  const decompressedPaletteData = decompressPalette(buffer.slice(12 + bitmapLength, 12 + bitmapLength + paletteLength));
  const bitplaneView = new DataView(decompressedImageData);
  const paletteView = new DataView(decompressedPaletteData);
  const { palette, bitsPerChannel } = createPalette(paletteView);

  // Spectrum images are 199 (not 200) pixels high.
  for (let line = 0; line < IMAGE_HEIGHT; line++) {
    for (let c = 0; c < IMAGE_WIDTH / 16; c++) {
      const indexes = decodeWordsToPaletteIndexes(bitplaneView, srcPosition, 4, imageDataView.byteLength / 64);
      for (let x = 0; x < indexes.length; x++) {
        const color = getPaletteColorOffset((c * 16) + x, line, indexes[x]);
        imageDataView.setUint32(destPosition, palette[color]);
        destPosition += 4;
      }
      srcPosition += 2;
    }
  }

  return {
    palette: new IndexedPalette(bitsPerChannel === 4 ? 4096 : 512, { bitsPerChannel }),
    imageData
  };
};
