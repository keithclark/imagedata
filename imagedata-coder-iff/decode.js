import ImageData from 'imagedata';
import { IffChunkReader } from './IffChunkReader.js';
import { depack as depackPackBits } from 'imagedata-coder-bitplane/compression/packbits.js';
import {
  decode as decodeBitplanes,
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_LINE,
  LineInterleavedBitplaneReader,
  ImageDataIndexedPaletteWriter,
  IndexedPalette,
  createAtariStIndexedPalette 
} from 'imagedata-coder-bitplane';
import { 
  COMPRESSION_NONE,
  COMPRESSION_PACKBITS,
  COMPRESSION_ATARI,
  AMIGA_MODE_EHB
} from './consts.js';


/**
 * Decodes an IFF image and returns a ImageData object containing the
 * converted data. Supports:
 * - ILBM and ACBM formats
 * - Amiga Extra Half Brite (EHB)
 * - Compression (Uncompressed, Packbits and Atari ST vertical RLE)
 * 
 * @param {ArrayBuffer} buffer - An array buffer containing the IFF image
 * @returns {Promise<{palette: IndexedPalette,imageData: ImageData}>} Image data and palette for the image
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
  if (formChunk.id !== 'FORM') {
    error();
  }

  // Is this a bitmap image?
  const type = formChunk.reader.readString(4);
  if (type !== 'ILBM' && type !== 'ACBM') {
    error();
  }

  // NEOChrome master files store their `RAST` data outside the `FORM` chunk
  // so we need to check for it here.
  while (!reader.eof()) {
    const { id, reader: rasterReader } = reader.readChunk();
    if (id === 'RAST') {
      rasters = extractRasterData(rasterReader);  
    }
  }

  // Decode the image chunks
  while (!formChunk.reader.eof()) {
    const { id, reader, length } = formChunk.reader.readChunk();

    // Parse the bitmap header.
    if (id === 'BMHD') {
      width = reader.readUint16();          // [+0x00] image width
      height = reader.readUint16();         // [+0x02] image height
      reader.readUint16();                  // [+0x04] x-origin
      reader.readUint16();                  // [+0x06] y-origin
      planes = reader.readUint8();         // [+0x08] number of planes
      reader.readUint8();                  // [+0x09] mask  
      compression = reader.readUint8();    // [+0x0A] compression mode

      bytesPerLine = Math.ceil(width / 8);
    } 
    
    // The CAMG chunk. Contains Amiga mode meta data
    // - bit 7  -- EHB (Extra Half-Brite) mode
    // - bit 11 -- HAM Hold-And-Modify)
    else if (id === 'CAMG') {
      amigaMode = reader.readUint32();
    }

    // The colour map. Stores the indexed palette.
    else if (id === 'CMAP') {
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
    else if (id === 'RAST') {
      rasters = extractRasterData(reader);
    }

    // ABIT - ACBM bitmap data
    else if (id === 'ABIT') {
      bitplaneData = reader.readBytes(length);
      bitplaneEncoding = ENCODING_FORMAT_CONTIGUOUS;
    }

    // Process the image body. If the image data is compressed then we 
    // decompress it into bitplane data.
    //
    // Note: We don't convert the image to `ImageData` here because some IFF 
    // implementations don't implement the spec properly and write the BODY 
    // chunk before other data.
    else if (id === 'BODY') {

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
        // chunks is compressed.
        while (!reader.eof()) {
          const { id, reader: chunkReader } = reader.readChunk();
          if (id === 'VDAT') {
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

  // If the image uses the Amiga's Extra Half-Brite mode and we only have a
  // 32 colour palette, we need to add the extra half-bright colours to be
  // able to decode the image correctly.
  if ((amigaMode & AMIGA_MODE_EHB) && palette.length === 32) {
    palette = createEhbPalette(palette);
  }

  // Decode the bitplane data into `ImageData` and return it along with the 
  // palette.
  const imageData = new ImageData(width, height);

  // If the image uses `RAST` chunks then we need to process the image line by 
  // line, decoding it with the relevent palette.
  if (rasters.length) {
    const reader = new LineInterleavedBitplaneReader(new Uint8Array(bitplaneData), planes, width);
    const writer = new ImageDataIndexedPaletteWriter(imageData, palette);

    for (let y = 0; y < height; y++) {
      writer.setPalette(rasters[y].resample(8));
      for (let x = 0; x < width; x++) {
        writer.write(reader.read());
      }
    }

    return {
      imageData: imageData,
      palette: rasters[0]
    };
  }

  // FIXME: If the image uses EHB, should we return the original palette or the
  // the extended version?
  await decodeBitplanes(new Uint8Array(bitplaneData), imageData, palette, { format: bitplaneEncoding });

  return {
    palette,
    imageData: imageData
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
 * Extends a palette by adding a 50% darker copy of every colour 
 * 
 * @param {IndexedPalette} palette - the palette to extend
 * @returns {IndexedPalette} the extended palette
 */
const createEhbPalette = (palette) => {
  const ehbPalette = new IndexedPalette(palette.length * 2);

  for (let c = 0; c < palette.length; c++) {
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
 * Helper method for reporting terminal errors
 */
const error = () => {
  throw 'Invalid file format';
};
