import BitplaneReader from './BitplaneReader.js';

/**
 * Provides an interface for reading pixel data from a planar image that is
 * encoded as a series of congituous bitplanes. This is a convenience 
 * class that preconfigures a `BitplaneReader` with the relevant `bytesPerBlock`
 * and `blockStep` values for traversing the bitplane data.
 */
export default class ContiguousBitplaneReader extends BitplaneReader {

  /**
   * @param {Uint8Array} buffer - A Uint8Array containing the planar image data
   * @param {number} planes - Number of bitplanes in the image
   * @param {number} width - The width of the image to decode in pixels
   * @param {number} height - The height of the image to decode in pixels
   */
  constructor(buffer, planes, width, height) {
    const bytesPerPlane = (width >> 3) * height;
    super(buffer, bytesPerPlane, 0, 1, 0, planes, bytesPerPlane);
  }
}
