import { decode as decodeBitplanes, IndexedPalette } from 'imagedata-coder-bitplane';
import { depack as depackPackBits } from 'imagedata-coder-bitplane/compression/packbits.js';
import { IffChunkReader } from './IffChunkReader.js';
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

  // Decode the image chunks
  while (!formChunk.reader.eof()) {
    const { id, reader, length } = formChunk.reader.readChunk();

    // Parse the bitmap header.
    if (id === 'BMHD') {
      width = reader.readWord();          // [+0x00] image width
      height = reader.readWord();         // [+0x02] image height
      reader.readWord();                  // [+0x04] x-origin
      reader.readWord();                  // [+0x06] y-origin
      planes = reader.readByte();         // [+0x08] number of planes
      reader.readByte();                  // [+0x09] mask  
      compression = reader.readByte();    // [+0x0A] compression mode

      bytesPerLine = Math.ceil(width / 8);
    } 
    
    // The CAMG chunk. Contains Amiga mode meta data
    // - bit 7  -- EHB (Extra Half-Brite) mode
    // - bit 11 -- HAM Hold-And-Modify)
    else if (id === 'CAMG') {
      amigaMode = reader.readLong();
    }

    // The colour map. Stores the indexed palette.
    else if (id === 'CMAP') {
      const size = length / 3;            // 3 bytes per colour entry
      palette = new IndexedPalette(size);
      for (let c = 0; c < size; c++) {
        const r = reader.readByte();      // Red channel
        const g = reader.readByte();      // Green channel
        const b = reader.readByte();      // Blue channel
        palette.setColor(c, r, g, b);
      }
    }

    // ABIT - ACBM bitmap data
    else if (id === 'ABIT') {
      bitplaneData = reader.readBytes(length);
      bitplaneEncoding = 'contiguous';
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
        bitplaneEncoding = 'line';
      }

      // Run-length encoded (Packbits)
      else if (compression === COMPRESSION_PACKBITS) {
        const outSize = bytesPerLine * height * planes;
        bitplaneData = depackPackBits(reader.readBytes(length), outSize);
        bitplaneEncoding = 'line';
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
        bitplaneEncoding = 'contiguous';
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

  // FIXME: If the image uses EHB, should we return the original palette or the
  // the extended version?
  const imageData = await decodeBitplanes(bitplaneData, palette, Math.ceil(width / 16) * 16, { format: bitplaneEncoding });
  return {
    palette,
    imageData
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
  const commandCount = reader.readWord() - 2;
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
        count = reader.readWord();
      } else {
        // If cmd < 0 the copy count is taken from the command
        count = -command;
      }
      
      // write the data to the bitplane buffer
      while (count-- > 0 && xOffset < bytesPerLine) {
        const offset = xOffset + yOffset * bytesPerLine;
        planeData[offset] = reader.readByte();
        planeData[offset + 1] = reader.readByte();
        if (++yOffset >= height) {
          yOffset = 0;
          xOffset += 2;
        }    
      }
      
    } else { 
      if (command == 1) {
        // If cmd == 1 the run-length count is taken from the data
        count = reader.readWord();
      } else {
        // If cmd > 1 the command is used as the run-length count
        count = command;
      }

      // Read the 16 bit values to repeat.
      const hiByte = reader.readByte();
      const loByte = reader.readByte();
    
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
const createEhbPalette = palette => {
  const ehbPalette = new IndexedPalette(palette.length * 2);

  for (let c = 0; c < palette.length; c++) {
    const { r, g, b } = palette.getColor(c);
    ehbPalette.setColor(c, r, g, b);
    ehbPalette.setColor(c + 32, r / 2, g / 2, b / 2);
  }
  
  return ehbPalette;
};


/**
 * Helper method for reporting terminal errors
 */
const error = () => {
  throw 'Invalid file format';
};
