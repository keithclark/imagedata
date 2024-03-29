import ImageData from 'imagedata';
import HamReader from './HamReader.js';
import { IffChunkReader } from './IffChunkReader.js';
import { depack as depackPackBits } from 'imagedata-coder-bitplane/compression/packbits.js';

import {
  decode as decodeBitplanes,
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_LINE,
  IndexedPalette,
  createAtariStIndexedPalette,
  LineInterleavedBitplaneReader,
  ImageDataIndexedPaletteWriter
} from 'imagedata-coder-bitplane';

import { 
  COMPRESSION_NONE,
  COMPRESSION_PACKBITS,
  COMPRESSION_ATARI,
  AMIGA_MODE_EHB,
  AMIGA_MODE_HAM,
  AMIGA_MODE_HIRES,
  AMIGA_MODE_LACE,
  IFF_CHUNK_ID_FORM,
  IFF_CHUNK_ID_ILBM,
  IFF_CHUNK_ID_ACBM,
  IFF_CHUNK_ID_RAST,
  IFF_CHUNK_ID_BMHD,
  IFF_CHUNK_ID_CMAP,
  IFF_CHUNK_ID_CAMG,
  IFF_CHUNK_ID_ABIT,
  IFF_CHUNK_ID_BODY,
  IFF_CHUNK_ID_VDAT
} from './consts.js';

/**
 * @typedef IffImageMetadata
 * @property {IndexedPalette|IndexedPalette[]} palette The palette or raster palettes for the image
 * @property {IffImageEncodingType} encoding The encoding method used for storing bitplanes
 * @property {boolean} amigaLace Indicates if this image requires the Amiga interlaced graphics mode
 * @property {boolean} amigaEhb Indicates if this image requires the Amiga EHB (extra half-brite) graphics mode
 * @property {boolean} amigaHam Indicates if this image requires the Amiga HAM (hold-and-modify) graphics mode
 * @property {boolean} amigaHires Indicates if this image requires the Amiga high resolution graphics mode
 * @property {number} planeCount Number of bitplanes used to store image palette indexes
 * @property {IffImageCompressionType} compression The compression method
 */

/**
 * @typedef IffImage
 * @property {ImageData} imageData - The decoded image data
 * @property {IffImageMetadata} meta - The image metadata
 */

/**
 * @typedef {ENCODING_FORMAT_CONTIGUOUS|ENCODING_FORMAT_LINE} IffImageEncodingType
 */

/**
 * @typedef {COMPRESSION_NONE|COMPRESSION_PACKBITS|COMPRESSION_ATARI} IffImageCompressionType
 */

/**
 * Decodes an IFF image and returns a ImageData object containing the
 * converted data. Supports:
 * - ILBM and ACBM formats
 * - Amiga Extra Half Brite (EHB)
 * - Amiga HAM6/8
 * - Compression (Uncompressed, Packbits and Atari ST vertical RLE)
 * 
 * @param {ArrayBuffer} buffer - An array buffer containing the IFF image
 * @returns {Promise<IffImage>} The decoded image
 */
export const decode = async (buffer) => {

  let compression;
  let width;
  let height;
  let planes;
  let palette;
  let amigaMode;
  let bytesPerLine;
  let bitplaneData;
  let bitplaneEncoding;
  let rasters = [];

  const reader = new IffChunkReader(buffer);

  // Check this is an IFF
  const formChunk = reader.readChunk();
  if (formChunk.id !== IFF_CHUNK_ID_FORM) {
    error();
  }

  // Is this a bitmap image?
  const type = formChunk.reader.readString(4);
  if (type !== IFF_CHUNK_ID_ILBM && type !== IFF_CHUNK_ID_ACBM) {
    error();
  }

  // Some NEOchrome Master IFF images store their `RAST` data outside the `FORM` 
  // chunk so we need to check for that here. Since it's not uncommon for IFF 
  // files to contain trailing garbage, it's not safe to assume that the next 
  // blob of data is a valid IFF chunk, a new reader instance is used look ahead
  // to determine if the next chunk is valid without advancing the main reader.
  if (reader.position < reader.byteLength - 8) {
    const lookAheadReader = new IffChunkReader(buffer, reader.position, 8);
    const chunkId = lookAheadReader.readString(4);
    const chunkSize = lookAheadReader.readUint32();
    // A valid `RAST` chunk is exactly 6800 bytes. (34 bytes * 200 lines)
    if (chunkId === IFF_CHUNK_ID_RAST && chunkSize === 6800) {
      rasters = extractRasterData(reader.readChunk().reader);  
    }
  }

  // Decode the image chunks
  while (!formChunk.reader.eof()) {
    const { id, reader, length } = formChunk.reader.readChunk();

    // Parse the bitmap header.
    if (id === IFF_CHUNK_ID_BMHD) {
      width = reader.readUint16();         // [+0x00] image width
      height = reader.readUint16();        // [+0x02] image height
      reader.readUint16();                 // [+0x04] x-origin
      reader.readUint16();                 // [+0x06] y-origin
      planes = reader.readUint8();         // [+0x08] number of planes
      reader.readUint8();                  // [+0x09] mask  
      compression = reader.readUint8();    // [+0x0A] compression mode
      bytesPerLine = Math.ceil(width / 16) * 2;
    } 

    // The CAMG chunk. Contains Amiga mode meta data
    // - bit 7  -- EHB (Extra Half-Brite) mode
    // - bit 11 -- HAM Hold-And-Modify)
    else if (id === IFF_CHUNK_ID_CAMG) {
      amigaMode = reader.readUint32();
    }

    // The colour map. Stores the indexed palette.
    else if (id === IFF_CHUNK_ID_CMAP) {
      const size = length / 3;            // 3 bytes per colour entry
      palette = new IndexedPalette(size);
      for (let c = 0; c < size; c++) {
        const r = reader.readUint8();      // Red channel
        const g = reader.readUint8();      // Green channel
        const b = reader.readUint8();      // Blue channel
        palette.setColor(c, r, g, b);
      }
    }

    // Some applications write the ST rasters into the `ILBM` so we need to 
    // check for that here.
    else if (id === IFF_CHUNK_ID_RAST) {
      rasters = extractRasterData(reader);
    }

    // ABIT - ACBM bitmap data
    else if (id === IFF_CHUNK_ID_ABIT) {
      bitplaneData = reader.readBytes(length);
      bitplaneEncoding = ENCODING_FORMAT_CONTIGUOUS;
    }

    // Process the image body. If the image data is compressed then we 
    // decompress it into bitplane data.
    //
    // Note: We don't convert the image to `ImageData` here because some IFF 
    // implementations don't follow the spec properly and write the BODY chunk 
    // before other data.
    else if (id === IFF_CHUNK_ID_BODY) {
      
      // No compression. Images are stored in line-interleaved format.
      if (compression === COMPRESSION_NONE) {
        bitplaneData = reader.readBytes(length);
        bitplaneEncoding = ENCODING_FORMAT_LINE;
      }

      // Run-length encoded (Packbits)
      else if (compression === COMPRESSION_PACKBITS) {
        const outSize = bytesPerLine * height * planes;
        bitplaneData = depackPackBits(reader.readBytes(length), outSize);
        bitplaneEncoding = ENCODING_FORMAT_LINE;
      }

      // Atari ST "VDAT" compression. Images are stored as individual bitplanes
      // which are run-length encoded in 16 pixel vertical strips.
      else if (compression === COMPRESSION_ATARI) {
        const bytesPerPlane = bytesPerLine * height;
        const buffer = new Uint8Array(bytesPerPlane * planes);
        let offset = 0;

        // Each bitplane is stored in its own "VDAT" chunk. The data in these
        // chunks is compressed and stored as a set of contiguous bitplanes
        while (!reader.eof()) {
          const { id, reader: chunkReader } = reader.readChunk();
          if (id === IFF_CHUNK_ID_VDAT) {
            const planeBuffer = depackVdatChunk(chunkReader, bytesPerLine, height);
            buffer.set(new Uint8Array(planeBuffer), offset);
            offset += bytesPerPlane;
          }
        }

        // Combine all bitplanes and encode the result as contiguous
        bitplaneData = buffer.buffer;
        bitplaneEncoding = ENCODING_FORMAT_CONTIGUOUS;
      }
    }
  }

  // Assert that we have all the required structures before we try to convert
  // the image into an `ImageData` object.

  // FIXME: Only indexed palette images are currently supported
  if (!bitplaneData || !palette) {
    error();
  }

  // If the image uses the Amiga's Extra Half-Brite mode we need to add the 
  // extra half-bright colours to be able to decode the image correctly.
  if ((amigaMode & AMIGA_MODE_EHB)) {
    palette = createEhbPalette(palette);
  }

  // Decode the bitplane data into `ImageData` and return it along with the 
  // palette.
  const imageData = new ImageData(width, height);

  /** @type {IffImageMetadata} */
  const meta = {
    compression,
    encoding: bitplaneEncoding,
    amigaLace: !!(amigaMode & AMIGA_MODE_LACE),
    amigaEhb: !!(amigaMode & AMIGA_MODE_EHB),
    amigaHam: !!(amigaMode & AMIGA_MODE_HAM),
    amigaHires: !!(amigaMode & AMIGA_MODE_HIRES),
    planeCount: planes
  };

  // This is an Amiga HAM image.
  if (amigaMode & AMIGA_MODE_HAM) {
    meta.palette = palette;
    decodeHamImage(bitplaneData, imageData, planes, palette);
  }

  // If the image uses `RAST` chunks then we need to process the image line by 
  // line, decoding it with the relevent palette.
  else if (rasters.length) {
    meta.palette = rasters;
    decodeRasterImage(bitplaneData, imageData, planes, palette, rasters);
  } 
  
  else {
    // FIXME: If the image uses EHB, should we return the original palette or the
    // the extended version?
    meta.palette = palette;
    await decodeBitplanes(new Uint8Array(bitplaneData), imageData, palette, { format: bitplaneEncoding });
  }

  return {
    imageData: imageData,
    meta
  };
};


/**
 * Decompresses a single bitplane of data (stored in a VDAT chunk)
 * 
 * @param {IffChunkReader} reader - A chunk reader instance
 * @param {number} bytesPerLine - Number of bytes in a bitplane scanline
 * @param {number} height - Number of vertical pixels in the image
 * @returns {ArrayBuffer} - Decompressed bitplane data
 */
const depackVdatChunk = (reader, bytesPerLine, height) => {
  const commandCount = reader.readUint16() - 2;
  const commands = new Int8Array(reader.readBytes(commandCount));
  const planeData = new Uint8Array(bytesPerLine * height);

  let xOffset = 0;
  let yOffset = 0;

  /** @type {number} */
  let count;

  for (let cmd = 0; cmd < commandCount; cmd++) {

    const command = commands[cmd];

    if (command <= 0) { 
      if (command === 0) {
        // If cmd == 0 the copy count is taken from the data
        count = reader.readUint16();
      } else {
        // If cmd < 0 the copy count is taken from the command
        count = -command;
      }
      
      // write the data to the bitplane buffer
      while (count-- > 0 && xOffset < bytesPerLine) {
        const offset = xOffset + yOffset * bytesPerLine;
        planeData[offset] = reader.readUint8();
        planeData[offset + 1] = reader.readUint8();
        if (++yOffset >= height) {
          yOffset = 0;
          xOffset += 2;
        }    
      }
      
    } else { 
      if (command == 1) {
        // If cmd == 1 the run-length count is taken from the data
        count = reader.readUint16();
      } else {
        // If cmd > 1 the command is used as the run-length count
        count = command;
      }

      // Read the 16 bit values to repeat.
      const hiByte = reader.readUint8();
      const loByte = reader.readUint8();
    
      // write the run-length encoded data to the bitplane buffer
      while (count-- > 0 && xOffset < bytesPerLine) {
        const offset = xOffset + yOffset * bytesPerLine;
        planeData[offset] = hiByte;
        planeData[offset + 1] = loByte;
        if (++yOffset >= height) {
          yOffset = 0;
          xOffset += 2;
        }
      }
    
      // Some images overflow so check EOF and bail out if we're done
      if (reader.eof()) {
        break;
      }

    }
  }
  return planeData.buffer;
};


/**
 * Extends a 32 colour palette by adding a 50% darker copy of every colour. 
 * Note: The value "32" is a hard-coded value here because some IFFs I've 
 * encountered incorrecly encode 64 colours into the CMAP when saving EHB.
 * 
 * @param {IndexedPalette} palette - the palette to extend
 * @returns {IndexedPalette} the extended palette
 */
const createEhbPalette = (palette) => {
  const ehbPalette = new IndexedPalette(64);

  for (let c = 0; c < 32; c++) {
    const { r, g, b } = palette.getColor(c);
    ehbPalette.setColor(c, r, g, b);
    ehbPalette.setColor(c + 32, r / 2, g / 2, b / 2);
  }
  
  return ehbPalette;
};


/**
 * Parses an Atari ST `RAST` chunk
 * 
 * @param {IffChunkReader} reader The `RAST` IFF chunk
 * @returns {Array<IndexedPalette>} A palette for each scan line of the image
 */
const extractRasterData = (reader) => {
  const rasters = [];

  while (!reader.eof()) {
    const line = reader.readUint16();
    const colors = new Uint8Array(reader.readBytes(32));
    rasters[line] = createAtariStIndexedPalette(colors, 16);
  }

  // Rasters can be missing for scanlines so we fill in the gaps
  for (let r = 1; r < 200; r++) {
    if (!rasters[r]) {
      rasters[r] = rasters[r - 1];
    }
  }

  return rasters;
};


/**
 * Decodes a HAM (Hold and Modify) encoded image
 * 
 * @param {ArrayBuffer} bitplaneData A buffer containing the raw bitplane data
 * @param {ImageData} imageData The image data to decode the image to
 * @param {IndexedPalette} palette The 16 color base palette
 */
const decodeHamImage = (bitplaneData, imageData, planes, palette) => {
  const { width, height } = imageData;
  const reader = new HamReader(new Uint8Array(bitplaneData), planes, width, palette);
  const planeWidth = Math.ceil(width / 16) * 16;
  const pixels = new DataView(imageData.data.buffer);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixels.setUint32((y * width + x) * 4, reader.read());
    }
    // Consume any remaining pixels if the image width is not a multiple of 16
    reader.advance(planeWidth - width);
  }
};


/**
 * Decodes a ILBM encoded image that uses per-scanline rasters
 * 
 * @param {ArrayBuffer} bitplaneData A buffer containing the raw bitplane data
 * @param {ImageData} imageData The image data to decode the image to
 * @param {number} planes The number of bitplanes for the image
 * @param {IndexedPalette} palette The color base palette
 * @param {IndexedPalette[]} rasters The raster color palettes
 */
const decodeRasterImage = (bitplaneData, imageData, planes, palette, rasters) => {
  const { width, height } = imageData;
  const reader = new LineInterleavedBitplaneReader(new Uint8Array(bitplaneData), planes, width);
  const writer = new ImageDataIndexedPaletteWriter(imageData, palette);

  for (let y = 0; y < height; y++) {
    writer.setPalette(rasters[y].resample(8));
    for (let x = 0; x < width; x++) {
      writer.write(reader.read());
    }
  }
};


/**
 * Helper method for reporting terminal errors
 */
const error = () => {
  throw 'Invalid file format';
};
