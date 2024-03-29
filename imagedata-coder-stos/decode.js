import ImageData from 'imagedata';

import { 
  ENCODING_FORMAT_WORD,
  createAtariStIndexedPalette,
  IndexedPalette,
  decode as decodeBitplanes
} from 'imagedata-coder-bitplane';

import { 
  MBK_DATA_TYPE_COMPRESSED_SCREEN,
  MBK_FILE_HEADER_ID,
  MBK_TYPE_DATA,
  MBK_FILE_HEADER_LENGTH
} from './consts.js';

const BYTES_PER_LINE = [160, 160, 80];
const BYTES_PER_PLANE = [8, 4, 2];
const PLANES = [4, 2, 1];
const LINES = [200, 200, 400];

/**
 * Called to terminate decoding in the event of an error.
 * @throws {Error}
 */
const error = () => {
  throw new Error('Invalid file format');
};


/**
 * Decodes a STOS Basic memory bank containing a packed image and generates a 
 * ImageData object containing the image data along with the original palette.
 *
 * @param {ArrayBuffer} buffer - An array buffer containing the image to decode
 * @returns {Promise<{palette: IndexedPalette,imageData: ImageData}>} Image data and palette for the image
 */
export default async (buffer) => {

  const dataView = new DataView(buffer);
  const textDecoder = new TextDecoder();

  // Check header
  if (textDecoder.decode(buffer.slice(0, 10)) !== MBK_FILE_HEADER_ID) {
    error();
  }

  // Is this a memory bank a databank?
  if (dataView.getUint8(0x0e) !== MBK_TYPE_DATA) {
    error();
  }

  // Check bank type is a picture
  if (dataView.getUint32(0x12) !== MBK_DATA_TYPE_COMPRESSED_SCREEN) {
    error();
  }

  // Get the resolution, low (0), med (1) or high (2)
  const res = dataView.getUint16(0x16);
  if (res > 2) {
    error();
  }

  // The decompressed data will be 32000 bytes
  const decompressedBytes = new Uint8Array(32000);
  const size = buffer.byteLength;
  const wordsPerPlane = dataView.getUint16(0x1c);   // Number of words in a line
  const blocks = dataView.getUint16(0x1e);          // Number of Y blocks
  const blockSize = dataView.getUint16(0x22);       // Number of lines in a Y block

  // Extract the palette
  const palette = createAtariStIndexedPalette(new Uint8Array(buffer, 0x38, 32), 16);

  const lineLength = BYTES_PER_LINE[res];
  const planeLength = BYTES_PER_PLANE[res];
  const planes = PLANES[res];
  const height = LINES[res];
  const blockLength = blockSize * lineLength;
  const width = (lineLength >> planes) * 32;

  let literal = 0x58;
  let mask0 = 0x80;
  let mask1 = 0x80;

  let pointer0 = dataView.getUint32(0x26) + MBK_FILE_HEADER_LENGTH;
  let pointer1 = dataView.getUint32(0x2a) + MBK_FILE_HEADER_LENGTH;

  let byte1 = dataView.getUint8(literal++);
  let cmd0 = dataView.getUint8(pointer0++);
  let cmd1 = dataView.getUint8(pointer1++);


  if (mask1 & cmd1) {
    cmd0 = dataView.getUint8(pointer0++);
  }

  mask1 >>= 1;
  
  for (let plane = 0; plane < planes; plane++) {
    let blockOffset = plane * 2;

    for (let block = blocks; block > 0; block--) {
      let lineOffset = blockOffset;

      for (let word = wordsPerPlane; word > 0; word--) {
        // Two bytes per word
        for (let byte = 0; byte < 2; byte++) {
          let offset = lineOffset + byte;
          
          for (let l = blockSize; l > 0; l--) {
            if (mask0 & cmd0) {
              byte1 = dataView.getUint8(literal++);
            }
            
            // Check we're not going to overflow  
            if (offset > 32000) {
              error();
            }

            // write the decompressed value to the output buffer
            decompressedBytes[offset] = byte1;

            offset += lineLength;
            mask0 >>= 1;

            if (mask0 == 0) {
              mask0 = 0x80;
              if (mask1 & cmd1) {
                cmd0 = dataView.getUint8(pointer0++);
              }

              mask1 >>= 1;

              if (mask1 == 0) {
                mask1 = 0x80;
                cmd1 = dataView.getUint8(pointer1++);
                if ((literal > size) || (pointer0 > size) || (pointer1 > size)) {
                  error();
                }
              }
            }
          }
        }
        lineOffset += planeLength;
      }
      blockOffset += blockLength;
    }
  }

  const imageData = new ImageData(width, height);

  await decodeBitplanes(decompressedBytes, imageData, palette, { format: ENCODING_FORMAT_WORD });

  return {
    imageData,
    meta: {
      palette
    }
  };
};

