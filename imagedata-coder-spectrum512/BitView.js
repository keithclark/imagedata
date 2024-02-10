/**
 * A low-level interface for reading data from an `ArrayBuffer` at a bit level
 */
export default class BitView {

  /**
   * @type {DataView}
   */
  #view;

  /**
   * @param {ArrayBuffer} buffer The `ArrayBuffer` to read bits from
   */
  constructor(buffer) {
    this.#view = new DataView(buffer);
  }

  /**
   * Reads a stream of bits from the buffer.
   * 
   * @param {Number} offset - Bit to start reading from
   * @param {Number} length - Number of bits to read (1 - 32)
   * @returns {Number} The unsigned numerical value of the bits
   * @throws {RangeError} if the number of bits is invalid or out of range. 
   */
  getBits(offset, length) {
    const byteOffset = (offset >> 3);
    const bitOffset = offset % 8;
    const mask = 0xffffffff >> (32 - length);

    if (bitOffset + length <= 8) {
      return ((this.#view.getUint8(byteOffset) >> (8 - bitOffset - length)) & mask) >>> 0;
    } else if (bitOffset + length <= 16) {
      return ((this.#view.getUint16(byteOffset) >> (16 - bitOffset - length)) & mask) >>> 0;
    } else if (bitOffset + length <= 32) {
      return ((this.#view.getUint32(byteOffset) >> (32 - bitOffset - length)) & mask) >>> 0;
    } else {
      throw new RangeError();
    }
  }

}
