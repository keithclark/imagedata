import { IffChunkWriter } from './IffChunkWriter.js';
import { pack } from 'imagedata-coder-bitplane/compression/packbits.js';
import {
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_LINE,
  encode as encodeBitplanes
} from 'imagedata-coder-bitplane';
/**
 * Encodes a `ImageData` object into an Degas image
 * 
 * @param {ImageData} imageData - The image data to encide
 * @param {IndexedPalette} palette - The color palette to use
 * @param {{compress:boolean,format:"ilbm"|"acbm"}} options - The encoding options
 * @returns {Promise<ArrayBuffer>} - The encoded Degas image bytes
 */
export const encode = async (imageData, palette, options = {}) => {

  const { 
    compress = true,
    format = 'ilbm'
  } = options;

  const { height, width } = imageData;
  const planeLength = width / 8 * height;
  const planes = Math.log(palette.length) / Math.log(2);
  const encoding = format === 'ilbm' ? ENCODING_FORMAT_LINE : ENCODING_FORMAT_CONTIGUOUS;
  let planeData = new Uint8Array(planeLength * planes);
  
  await encodeBitplanes(imageData, planeData, palette, { format: encoding });

  if (compress && encoding !== ENCODING_FORMAT_CONTIGUOUS) {
    const compressedData = new Uint8Array(planeData.length);
    const compressedSize = pack(planeData, compressedData);
    planeData = compressedData.slice(0, compressedSize);
  }

  const buffer = new ArrayBuffer(planeData.length + 2048);
  const writer = new IffChunkWriter(buffer);

  writer.startChunk('FORM');
  
  if (format === 'ilbm') {
    writer.writeString('ILBM');
  } else if (format === 'acbm') {
    writer.writeString('ACBM');
  } else {
    throw new Error('Unsupported IFF format');
  }

  // The header
  writer.startChunk('BMHD');
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
  writer.startChunk('CMAP');
  for (const {r, g, b} of palette.resample(8)) {
    writer.writeInt8(r);
    writer.writeInt8(g);
    writer.writeInt8(b);
  }
  writer.endChunk();

  if (format === 'ilbm') {
    writer.startChunk('BODY');
  } else {
    writer.startChunk('ABIT');
  }
  writer.writeBytes(planeData);
  writer.endChunk();

  return buffer.slice(0, writer.endChunk());
};
