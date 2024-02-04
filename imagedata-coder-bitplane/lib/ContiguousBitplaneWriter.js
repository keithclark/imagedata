import BitplaneWriter from './BitplaneWriter.js';

/**
 * Provides an interface for writing pixel data to a planar image that is
 * encoded as a series of congituous bitplanes. This is a convenience 
 * class that preconfigures a `BitplaneWriter` with the relevant `bytesPerBlock`
 * and `blockStep` values for traversing the bitplane data.
 */
export default class ContiguousBitplaneWriter extends BitplaneWriter {

  /**
   * @param {Uint8Array} buffer - A Uint8Array containing the planar image data
   * @param {number} planes - Number of bitplanes in the image
   * @param {number} width - The width of the image in pixels.
   * @param {number} height - The height of the image in pixels
   */
  constructor(buffer, planes, width, height) {
    const bytesPerPlane = (width >> 3) * height;
    super(buffer, bytesPerPlane, 0, 1, 0, planes, bytesPerPlane);
  }
}
