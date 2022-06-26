import ImageData from 'imagedata';
import { 
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_LINE,
  ENCODING_FORMAT_WORD
} from './consts.js';
import { IndexedPalette } from './IndexedPalette.js';


/**
 * Decodes bitplane data into ImageData
 *
 * @param {ArrayBuffer} buffer - An array buffer containing the bitmap data
 * @param {IndexedPalette} palette - The image palette
 * @param {Number} imageWidth - The width of the image (in pixels) being decoded (multiples of 16)
 * @param {import('./types.js').BitplaneEncodingOptions} options - Decoder options
 * @returns {Promise<ImageData>} An array containing bitplane encoded data
 */
export const decode = (buffer, palette, imageWidth, options = {}) => new Promise(resolve => {

  // Ensure the image width is a multiple of 16 pixels  
  if (imageWidth % 16 !== 0) {
    throw new Error('Image width must be multiple of 16');
  }

  // Convert the palette into an array of unsigned 32 bit integers.
  let colors;
  if (palette instanceof IndexedPalette) {
    if (palette.bitsPerChannel != 8) {
      palette = palette.resample(8);
    }
    colors = palette.toValueArray();
  } else {
    console.warn('Bitplane decoder support for Uint32Array palettes is deprecated. Use `IndexedPalette` instead');
    colors = palette;
  }

  // Ensure the palette contains enough entries to decode the number of planes
  let planes = Math.log(palette.length) / Math.log(2);
  if (!Number.isInteger(planes)) {
    throw new Error('Palette length must be a power of 2');
  }

  planes |= 0; // performance

  const { format = ENCODING_FORMAT_WORD } = options;
  const wordsPerLine = imageWidth >> 4;
  const bufferView = new DataView(buffer);
  const bitPlaneLength = buffer.byteLength / planes / 2;
  const imageData = new ImageData(imageWidth, bitPlaneLength / wordsPerLine);
  const imageDataView = new DataView(imageData.data.buffer);

  if (format === ENCODING_FORMAT_CONTIGUOUS) { 
    decodeContiguous(bufferView, imageDataView, colors, planes, bitPlaneLength);
  } else if (format === ENCODING_FORMAT_WORD) { 
    decodeInterleavedWord(bufferView, imageDataView, colors, planes, bitPlaneLength);
  } else if (format === ENCODING_FORMAT_LINE) { 
    decodeInterleavedLine(bufferView, imageDataView, colors, planes, bitPlaneLength, wordsPerLine);
  } else {
    throw new Error('Invalid format');
  }
  resolve(imageData);
});

const decodeContiguous = (bufferView, imageDataView, colors, planes, bitPlaneLength) => {
  for (let wordIndex = 0; wordIndex < bitPlaneLength; wordIndex++) {
    for (let bit = 0; bit < 16; bit++) {
      let colorIndex = 0;
      for (let plane = 0; plane < planes; plane++) {
        const offset = (plane * bitPlaneLength + wordIndex) * 2;
        colorIndex |= (bufferView.getUint16(offset) >> (15 - bit) & 1) << plane;
      }
      imageDataView.setUint32((wordIndex * 16 + bit) * 4, colors[colorIndex]);
    }
  }
};

const decodeInterleavedWord = (bufferView, imageDataView, colors, planes, bitPlaneLength) => {
  for (let wordIndex = 0; wordIndex < bitPlaneLength; wordIndex++) {
    for (let bit = 0; bit < 16; bit++) {
      let colorIndex = 0;
      for (let plane = 0; plane < planes; plane++) {
        const offset = (wordIndex * planes + plane) * 2;
        colorIndex |= (bufferView.getUint16(offset) >> (15 - bit) & 1) << plane;
      }
      imageDataView.setUint32((wordIndex * 16 + bit) * 4, colors[colorIndex]);
    }
  }
};

const decodeInterleavedLine = (bufferView, imageDataView, colors, planes, bitPlaneLength, wordsPerLine) => {
  for (let wordIndex = 0; wordIndex < bitPlaneLength; wordIndex++) {
    for (let bit = 0; bit < 16; bit++) {
      let colorIndex = 0;
      for (let plane = 0; plane < planes; plane++) {
        const line = Math.floor(wordIndex / wordsPerLine);
        const offset = (line * planes + plane) * 2 * wordsPerLine + ((wordIndex % wordsPerLine)) * 2;
        colorIndex |= (bufferView.getUint16(offset) >> (15 - bit) & 1) << plane;
      }
      imageDataView.setUint32((wordIndex * 16 + bit) * 4, colors[colorIndex]);
    }
  }
};
