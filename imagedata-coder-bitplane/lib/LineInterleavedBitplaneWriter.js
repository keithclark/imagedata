import BitplaneWriter from './BitplaneWriter.js';

/**
 * Provides an interface for reading pixel data to a planar image that is
 * encoded as a series of line-interleaved bitplanes. This is a convenience 
 * class that preconfigures a `BitplaneWriter` with the relevant `bytesPerBlock`
 * and `blockStep` values for traversing the bitplane data.
 */
export default class LineInterleavedBitplaneWriter extends BitplaneWriter {

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
