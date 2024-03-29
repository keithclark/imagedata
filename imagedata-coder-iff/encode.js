import { IffChunkWriter } from './IffChunkWriter.js';
import { pack } from 'imagedata-coder-bitplane/compression/packbits.js';

import {
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_LINE,
  encode as encodeBitplanes
} from 'imagedata-coder-bitplane';

import { 
  IFF_CHUNK_ID_ABIT,
  IFF_CHUNK_ID_ACBM,
  IFF_CHUNK_ID_BMHD,
  IFF_CHUNK_ID_BODY,
  IFF_CHUNK_ID_CMAP,
  IFF_CHUNK_ID_FORM,
  IFF_CHUNK_ID_ILBM,
  IFF_ENCODING_FORMAT_ACBM,
  IFF_ENCODING_FORMAT_ILBM
} from './consts.js';

/**
 * @typedef IffEncodingOptions
 * @property {boolean} compress Should the image be compressed
 * @property {IFF_ENCODING_FORMAT_ILBM|IFF_ENCODING_FORMAT_ACBM} format The encoding format 
 */

/**
 * Encodes a `ImageData` object into an IFF image
 * 
 * @param {ImageData} imageData - The image data to encode
 * @param {IndexedPalette} palette - The color palette to use
 * @param {IffEncodingOptions} options - The encoding options
 * @returns {Promise<ArrayBuffer>} - The encoded IFF image bytes
 */
export const encode = async (imageData, palette, options = {}) => {

  const { 
    compress = true,
    format = IFF_ENCODING_FORMAT_ILBM
  } = options;

  const { height, width } = imageData;
  const planeLength = width / 8 * height;
  const planes = Math.log(palette.length) / Math.log(2);
  const encoding = format === IFF_ENCODING_FORMAT_ILBM ? ENCODING_FORMAT_LINE : ENCODING_FORMAT_CONTIGUOUS;
  let planeData = new Uint8Array(planeLength * planes);
  
  await encodeBitplanes(imageData, planeData, palette, { format: encoding });

  if (compress && encoding !== ENCODING_FORMAT_CONTIGUOUS) {
    const compressedData = new Uint8Array(planeData.length);
    const compressedSize = pack(planeData, compressedData);
    planeData = compressedData.slice(0, compressedSize);
  }

  const buffer = new ArrayBuffer(planeData.length + 2048);
  const writer = new IffChunkWriter(buffer);

  writer.startChunk(IFF_CHUNK_ID_FORM);
  
  if (format === IFF_ENCODING_FORMAT_ILBM) {
    writer.writeString(IFF_CHUNK_ID_ILBM);
  } else if (format === IFF_ENCODING_FORMAT_ACBM) {
    writer.writeString(IFF_CHUNK_ID_ACBM);
  } else {
    throw new Error('Unsupported IFF format');
  }

  // The header
  writer.startChunk(IFF_CHUNK_ID_BMHD);
  writer.writeUint16(width);            // [+0x00] image width
  writer.writeUint16(height);           // [+0x02] image height
  writer.writeInt16(0);                 // [+0x04] x-origin
  writer.writeInt16(0);                 // [+0x06] y-origin
  writer.writeUint8(planes);            // [+0x08] number of planes
  writer.writeUint8(0);                 // [+0x09] mask  
  writer.writeUint8(compress ? 1 : 0);  // [+0x0A] compression mode
  writer.writeUint8(0);                 // [+0x0B] pad1  
  writer.writeUint16(0);                // [+0x0C] transparent color
  writer.writeUint8(1);                 // [+0x0E] x aspect
  writer.writeUint8(1);                 // [+0x0F] y aspect 
  writer.writeInt16(width);             // [+0x0A] pageWidth
  writer.writeInt16(height);            // [+0x0C] pageHeight
  writer.endChunk();
  
  // The palette
  writer.startChunk(IFF_CHUNK_ID_CMAP);
  for (const { r, g, b } of palette.resample(8)) {
    writer.writeInt8(r);
    writer.writeInt8(g);
    writer.writeInt8(b);
  }
  writer.endChunk();

  if (format === IFF_ENCODING_FORMAT_ILBM) {
    writer.startChunk(IFF_CHUNK_ID_BODY);
  } else {
    writer.startChunk(IFF_CHUNK_ID_ABIT);
  }
  writer.writeBytes(planeData);
  writer.endChunk();

  return buffer.slice(0, writer.endChunk());
};
