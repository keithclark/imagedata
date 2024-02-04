import BitplaneWriter from './BitplaneWriter.js';

/**
 * Provides an interface for writing pixel data to a planar image that is
 * encoded as a series of word-interleaved bitplanes. This is a convenience 
 * class that preconfigures a `BitplaneWriter` with the relevant `bytesPerBlock`
 * and `blockStep` values for traversing the bitplane data.
 */
export default class WordInterleavedBitplaneWriter extends BitplaneWriter {
  
  /**
   * @param {Uint8Array} buffer - A Uint8Array containing the planar image data
   * @param {number} planes - Number of bitplanes in the image
   */
  constructor(buffer, planes) {
    super(buffer, 2, planes * 2, 2, planes * 4, planes, 2);
  }
}
