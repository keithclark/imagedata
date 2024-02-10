import BitView from './BitView.js';
import ImageData from 'imagedata';

import {
  ImageDataIndexedPaletteWriter,
  IndexedPalette, ContiguousBitplaneReader, createAtariStIndexedPalette, BitplaneReader
} from 'imagedata-coder-bitplane';


import {
  getPaletteColorOffset
} from './common.js';

import { 
  ERROR_MESSAGE_INVALID_FILE_FORMAT,
  SPECTRUM_FILE_HEADER,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  COLORS_PER_SCANLINE,
  PALETTES_PER_SCANLINE
} from './consts.js';

/**
 * @typedef {import('./types.js').DecodedImage} DecodedImage
 */


/**
 * Decompresses the palette.
 * 
 * Each 16 colour palette consists of a header followed by the colour data.
 * The header is a 14 bit mask where a `1` indicates the colour exists in
 * the colour data and `0` indicates the colour isn't and should be treated as
 * black. Colours are stored in 9 bits, `rrrggbb`.
 * 
 * @param {ArrayBuffer} buffer - The `ArrayBuffer` containing the compressed data
 * @returns {ArrayBuffer} An `ArrayBuffer` containing the uncompressed data
 */
export const decompressPalette = (buffer) => {
  const palette = new ArrayBuffer(COLORS_PER_SCANLINE * IMAGE_HEIGHT * 2);
  const destView = new DataView(palette);
  const srcView = new BitView(buffer);

  let srcPos = 0;
  let outPos = 0;

  for (let paletteNo = 0; paletteNo < PALETTES_PER_SCANLINE * IMAGE_HEIGHT; paletteNo++) {
    let header = srcView.getBits(srcPos, 14);
    srcPos += 14;

    for (let colorNo = 0; colorNo < 16; colorNo++) {
      if (colorNo === 0 || colorNo === 15) {
        destView.setUint16(outPos, 0);
        outPos += 2;
      } else {
        if (header & 0x2000) {
          const bits = srcView.getBits(srcPos, 9);
          srcPos = srcPos + 9;
          const r = (bits >> 6) & 7;
          const g = (bits >> 3) & 7;
          const b = bits & 7;
          destView.setUint16(outPos, r << 8 | g << 4 | b);
          outPos += 2;
        } else {
          destView.setUint16(outPos, 0);
          outPos += 2;
        }
        header = header << 1;
      }
    }
  }
  return palette;
};


/**
 * Decompresses SPC run-length encoded bitmap data.
 * 
 * @param {ArrayBuffer} buffer - The `ArrayBuffer` containing the compressed data
 * @returns {ArrayBuffer} An `ArrayBuffer` containing the uncompressed data
 */
export const decompressImage = (buffer) => {
  const srcView = new DataView(buffer);
  const outBuffer = new ArrayBuffer(IMAGE_WIDTH * IMAGE_HEIGHT / 2);
  const outView = new DataView(outBuffer);
  const srcLength = srcView.byteLength - 1;

  let outPos = 0;
  let srcPos = 0;

  while (srcPos < srcLength) {
    const header = srcView.getUint8(srcPos++);
    if (header <= 127) {
      const data = srcView.getUint8(srcPos++);
      for (let i = header + 3; i > 0; i--) {
        outView.setUint8(outPos++, data);
      }
    } else {
      for (let i = header - 128 + 1; i > 0; i--) {
        outView.setUint8(outPos++, srcView.getUint8(srcPos++));
      }
    }
  }
  return outBuffer;
};


/**
 * Decodes a "smooshed" Spectrum 512 image and returns a ImageData object
 * containing the converted data. Colors are converted from 12bit RGB to 32bit 
 * RGBA format.
 * 
 * @param {ArrayBuffer} buffer - An array buffer containing the image
 * @returns {Promise<DecodedImage>} A promise that resolves with the decoded image
 * @throws {Error} If the image data is invalid
 */
export const decode = (buffer) => {
  const bufferView = new DataView(buffer);

  // Check the file header is valid
  if (bufferView.getUint32(0) !== SPECTRUM_FILE_HEADER) {
    throw new Error(ERROR_MESSAGE_INVALID_FILE_FORMAT);
  }

  const encodingMethod = bufferView.getUint8(buffer.byteLength - 1) & 1;
  const bitmapLength = bufferView.getUint32(4);
  const paletteLength = bufferView.getUint32(8);
  const decompressedImageData = new Uint8Array(decompressImage(buffer.slice(12, 12 + bitmapLength)));
  const decompressedPaletteData = decompressPalette(buffer.slice(12 + bitmapLength, 12 + bitmapLength + paletteLength));

  const palette = createAtariStIndexedPalette(new Uint8Array(decompressedPaletteData), COLORS_PER_SCANLINE * IMAGE_HEIGHT);
  const imageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
  const writer = new ImageDataIndexedPaletteWriter(imageData, palette);



  const { bitsPerChannel } = palette;



  let reader;

  if (encodingMethod === 1) {
    // contiguous bitplanes
    reader = new ContiguousBitplaneReader(decompressedImageData, 4, IMAGE_WIDTH, IMAGE_HEIGHT);
  } else {
    // vertical bands of 8 bits
    reader = new BitplaneReader(decompressedImageData, 1, IMAGE_HEIGHT, 40, 1, 4, IMAGE_HEIGHT * 40);
  }

  for (let y = 0; y < IMAGE_HEIGHT; y++) {
    for (let x = 0; x < IMAGE_WIDTH; x++) {
      const color = reader.read();
      const mappedColor = getPaletteColorOffset(x, y, color);
      writer.write(mappedColor);
    }
  }
  return {
    meta: {
      palette: new IndexedPalette(bitsPerChannel === 4 ? 4096 : 512, { bitsPerChannel }),
    },
    imageData
  };
};
