import BitplaneReader from './BitplaneReader.js';

/**
 * Provides an interface for reading pixel data from a planar image that is
 * encoded as a series of word-interleaved bitplanes. This is a convenience 
 * class that preconfigures a `BitplaneReader` with the relevant `bytesPerBlock`
 * and `blockStep` values for traversing the bitplane data.
 */
export default class LineInterleavedBitplaneReader extends BitplaneReader {
  
  /**
   * @param {Uint8Array} buffer - A Uint8Array containing the planar image data
   * @param {number} planes - Number of bitplanes in the image
   * @param {number} width - The width of the image in pixels
   */
  constructor(buffer, planes, width) {
    const bytesPerLine = (width >> 3);
    super(buffer, bytesPerLine, 0, 1, bytesPerLine * (planes), planes, bytesPerLine);
  }
}
