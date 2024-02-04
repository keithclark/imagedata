/*

For word interleaved:
---------------------

bytesPerBlock == 2 ; // read 2 bytes
blockStep = 6        // skip 6 bytes

|- block -|
|         |
|  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 
|    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 
|         |         |         |         |         |         |         |         |         |         |         |         |         |         |         |         |
|- pln 1 -|- pln 2 -|- pln 3 -|- pln 4 -|- pln 1 -|- pln 2 -|- pln 3 -|- pln 4 -|- pln 1 -|- pln 2 -|- pln 3 -|- pln 4 -|- pln 1 -|- pln 2 -|- pln 3 -|- pln 4 -|
|------------ pixels 0 - 15 ------------|------------ pixels 16 - 31 -----------|------------ pixels 0 - 15 ------------|------------ pixels 16 - 31 -----------|
|------------------------------------ line 0 -----------------------------------|------------------------------------ line 1 -----------------------------------|


For ILBM:
---------

bytesPerBlock == 4 ; // read 4 bytes
blockStep = 12       // skip 12 bytes

|- block -|
|         |
 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 
|                   |                   |                   |                   |                   |                   |                   |                   |
|------ pln 1 ------|------ pln 2 ------|------ pln 3 ------|------ pln 4 ------|------ pln 1 ------|------ pln 2 ------|------ pln 3 ------|------ pln 4 ------|
|-------------------------------- pixels 0 - 47 --------------------------------|-------------------------------- pixels 0 - 47 --------------------------------|
|------------------------------------ line 0 -----------------------------------|------------------------------------ line 1 -----------------------------------|


For ACBM:
--------

bytesPerBlock == 8 ; // read 8 bytes
blockStep = 0       // skip 12 bytes


|- block -|
|         |
 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 
|----------------- pln 1 ---------------|----------------- pln 2 ---------------|----------------- pln 3 ---------------|----------------- pln 4 ---------------|
|----- line 0 ------|------ line 1 -----|----- line 0 ------|------ line 1 -----|----- line 0 ------|------ line 1 -----|----- line 0 ------|------ line 1 -----|


For SPS:
--------

bytesPerBlock == 8 ; // read 8 bytes
blockStep = 0       // skip 12 bytes


             |- block -|
             |         |
             |  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 
             |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
              0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 
             |         |         |         |         |         |         |         |         |         |         |         |         |         |         |         |         |
Line         | 1  | 2  |- pln 3 -|- pln 4 -|- pln 1 -|- pln 2 -|- pln 3 -|- pln 4 -|- pln 1 -|- pln 2 -|- pln 3 -|- pln 4 -|- pln 1 -|- pln 2 -|- pln 3 -|- pln 4 -|
Pixels       |0-7 |0-7 | -------- pixels 0 - 15 ------------|------------ pixels 16 - 31 -----------|------------ pixels 0 - 15 ------------|------------ pixels 16 - 31 -----------|
Plane        | 1  | 1  |
             |------------------------------------ line 0 -----------------------------------|------------------------------------ line 1 -----------------------------------|

*/

/**
 * Provides an interface for writing pixel data to a planar image that is
 * encoded as a series bitplanes. The writer will walk the bitmap data, using
 * the `bytesPerBlock` and `blockStep` values passed to the constructor.
 * 
 * If you wish to work with bitplanes encoded as word-interleaved (Atari ST), 
 * line-interleaved (Amiga ILBM) or contiguous (Amiga ACBM) then you should use
 * the relevant writer classes. 
 */
export default class BitplaneWriter {

  /** @type {Uint8Array} */
  #buffer;

  /** @type {number} */
  #planes;

  /** @type {number} */
  #bytesPerBlock;

  /** @type {number} */
  #blockStep;

  #blocksPerLine;
  #lineStep;
  #planeStep;
  #byte = 0;
  #block = 0;
  #line = 0;
  #bit = 0;


  /**
   * 
   * @param {Uint8Array} buffer - A Uint8Array containing the planar image data
   * @param {number} bytesPerBlock - Number of concurrent bytes of bitplane data
   * @param {number} blockStep - Number of bytes to step in order to reach next bitplane chunk 
   * @param {number} blocksPerLine - Number of bytes used to store a single scanline for a bitplane
   * @param {number} lineStep - Number of bytes to step in order to reach next scanline for a bitplane
   * @param {number} planeStep
   * @param {number} planes - Number of bitplanes in the image 
   * @example <caption>Atari ST word-interleaved</caption>
   * new BitplaneWriter(buffer, 2, planes * 2, 2, planes * 4, planes, 2) 
   * @example <caption>Amiga ILBM (line-interleaved)</caption>
   * const bytesPerLine = (width >> 3);
   * new BitplaneWriter(buffer, bytesPerLine, 0, 1, bytesPerLine * (planes), planes, bytesPerLine);
   * @example <caption>Amiga ACBM (contigous)</caption>
   * const bytesPerPlane = (width >> 3) * height;
   * new BitplaneWriter(buffer, bytesPerPlane, 0, 1, 0, planes, bytesPerPlane);  */
  constructor(buffer, bytesPerBlock, blockStep, blocksPerLine, lineStep, planes, planeStep) {
    this.#buffer = buffer;
    this.#planes = planes;
    this.#blocksPerLine = blocksPerLine;
    this.#bytesPerBlock = bytesPerBlock;
    this.#blockStep = blockStep;
    this.#lineStep = lineStep;
    this.#planeStep = planeStep;
  }

  /**
   * Reads the next pixel and returns its color palette index.
   * 
   * @param {number} color The palette index of the next pixel in the image
   * @throws {RangeError} If the reader exceeds the bounds of the buffer
   */
  write(color) {

    const pos = this.#byte + (this.#block * this.#blockStep) + (this.#line * this.#lineStep);

    for (let plane = 0; plane < this.#planes; plane++) {
      const bit = color & 1;
      color >>= 1;
      if (bit) {
        const offset = pos + (plane * this.#planeStep);
        this.#buffer[offset] |= 1 << (7 - this.#bit);
      }
    }

    if (this.#bit < 7) {
      this.#bit++;
    } else {
      this.#bit = 0;
      if (this.#byte < this.#bytesPerBlock - 1) {
        this.#byte++;
      } else {
        this.#byte = 0;
        if (this.#block < this.#blocksPerLine - 1) {
          this.#block++;
        } else {
          this.#block = 0;
          this.#line++;
        }
      }
    }
  }
}
