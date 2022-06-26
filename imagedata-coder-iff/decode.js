import { decode as decodeBitplanes, IndexedPalette } from 'imagedata-coder-bitplane';
import { depack as depackPackBits } from 'imagedata-coder-bitplane/compression/packbits.js';
import { 
  CHUNK_ID_ACBM,
  CHUNK_ID_ILBM,
  CHUNK_ID_FORM,
  CHUNK_ID_BMHD,
  CHUNK_ID_CMAP,
  CHUNK_ID_ABIT,
  CHUNK_ID_BODY,
  CHUNK_ID_CAMG,
  COMPRESSION_NONE,
  COMPRESSION_PACKBITS,
  AMIGA_MODE_EHB
} from './consts.js';


/**
 * Decodes an IFF image and returns a ImageData object containing the
 * converted data. 
 * @param {ArrayBuffer} buffer - An array buffer containing the IFF image
 * @returns {Promise<{palette: IndexedPalette,imageData: ImageData}>} Image data and palette for the image
 */
export const decode = async buffer => {

  const dataView = new DataView(buffer);
  let chunk = parseChunk(dataView);
  let width;
  let height;
  let palette;
  let compression = 0;
  let pos = 0;
  let amigaMode = 0;
  let bitPlanes;

  // FORM
  if (chunk.id !== CHUNK_ID_FORM) {
    throw 'Not an IFF';
  }

  // ILBM or ACBM
  const type = chunk.dataView.getUint32(0);
  if (type !== CHUNK_ID_ILBM && type !== CHUNK_ID_ACBM) {
    throw 'Invalid image format';
  }

  pos += 4;

  while (pos < chunk.length) {
    const chunk2 = parseChunk(chunk.dataView, pos);


    // BMHD
    if (chunk2.id === CHUNK_ID_BMHD) {
      width = chunk2.dataView.getUint16(0);
      height = chunk2.dataView.getUint16(2);
      bitPlanes = chunk2.dataView.getUint8(8);
      compression = chunk2.dataView.getUint8(10);
    }

    // CMAP chunk. Contains the image colour palette
    else if (chunk2.id === CHUNK_ID_CMAP) {
      const size = chunk2.length / 3;
      palette = new IndexedPalette(size);
      for (let c = 0; c < size; c++) {
        const r = chunk2.dataView.getUint8(c * 3);
        const g = chunk2.dataView.getUint8(c * 3 + 1);
        const b = chunk2.dataView.getUint8(c * 3 + 2); 
        palette.setColor(c, r, g, b);
      }
    }

    // The CAMG chunk. Contains amiga mode metadata (EHB)
    else if (chunk2.id === CHUNK_ID_CAMG) {
      amigaMode = chunk2.dataView.getUint32(0);
    }

    // The BODY chunk. Contains the ILBM image data. As per the IFF spec, this
    // chunk must come after BMHD, CAMG and CMAP so we can decode the image data 
    // and return from this chunk without processing any other chunks.
    else if (chunk2.id === CHUNK_ID_BODY) {
      if (!palette) {
        throw 'Non-bitplane images are not supported';
      }

      // If the image uses the Amiga's Extra Half-Brite mode and we only have a
      // 32 colour palette, we need to add the extra half-bright colours to be
      // able to decode the image correctly.
      if ((amigaMode & AMIGA_MODE_EHB) === AMIGA_MODE_EHB && palette.length === 32) {
        palette = createEhbPalette(palette);
      }

      let bitplaneData = chunk2.dataView.buffer.slice(chunk2.start, chunk2.end);
      if (compression === COMPRESSION_PACKBITS) {
        const outSize = (width / 8) * height * bitPlanes;
        bitplaneData = depackPackBits(bitplaneData, outSize);
      } else if (compression !== COMPRESSION_NONE) {
        throw 'Unknown compression method';
      }

      const imageData = await decodeBitplanes(bitplaneData, palette, width, { format: 'line' });
      return {
        palette,
        imageData
      };
    }

    // ABIT - ACBM bitmap data
    else if (chunk2.id === CHUNK_ID_ABIT) {
      const bitplaneData = chunk2.dataView.buffer.slice(chunk2.start, chunk2.end);
      const imageData = await decodeBitplanes(bitplaneData, palette, width, { format: 'contiguous' });
      return {
        palette,
        imageData
      };
    }

    // Chunks are word aligned so, if the chunk length is even, move over the 
    // padding byte.
    if (chunk2.length % 2 === 1) {
      pos++;
    }

    // Move to the next chunk.
    pos += chunk2.length + 8;
  }

};


/**
 * Parses a data view and returns an IFF chunk
 * 
 * @param {DataView} dataView 
 * @param {Number} offset 
 * @returns 
 */
const parseChunk = (dataView, offset = 0) => {
  const id = dataView.getUint32(offset);
  const length = dataView.getUint32(offset + 4);
  const start = dataView.byteOffset + offset + 8;
  const end = start + length;
  return {
    id, 
    start,
    end,
    length,
    dataView: new DataView(dataView.buffer, start, length)
  };
};


/**
 * Extends a palette by adding a 50% darker copy of every colour 
 * 
 * @param {IndexedPalette} palette - the palette to extend
 * @returns {IndexedPalette} the extended palette
 */
const createEhbPalette = palette => {
  const ehbPalette = new IndexedPalette(palette.length * 2);

  for (let c = 0; c < palette.length; c++) {
    const { r, g, b } = palette.getColor(c);
    ehbPalette.setColor(c, r, g, b);
    ehbPalette.setColor(c + 32, r / 2, g / 2, b / 2);
  }
  
  return ehbPalette;
};
