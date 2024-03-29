import { LineInterleavedBitplaneReader } from 'imagedata-coder-bitplane';

/**
 * Provides an interface for reading pixel data from a Amiga HAM encoded planar 
 * image.
 */
export default class HamReader extends LineInterleavedBitplaneReader {

  #colors;
  #scale;
  #currentColor;
  #mask

  /** @type {number} */
  #planes;

  constructor(buffer, planes, width, palette) {
    // Ensure the reader is configured to consume images on a 16 bit boundary. 
    // This allows images that aren't multiple of 16 pixels to be correctly
    // decoded .
    const planeWidth = Math.ceil(width / 16) * 16;
    
    super(buffer, planes, planeWidth);
    this.#planes = planes - 2;
    this.#colors = palette.toValueArray();
    this.#scale = 255 / (1 << this.#planes);
    this.#mask = (1 << this.#planes) - 1;
  }

  /**
   * Reads the next pixel and returns the 24 bit RGB colour value
   * 
   * @returns {number} A 32 bit RGBA colour value for the pixel
   */
  read() {
    this.#step();
    return this.#currentColor;
  }

  advance(pixels) {
    for (let c = pixels; c > 0; c--) {
      this.#step();
    }
  }

  #step() {
    const c = super.read();
    if (c <= this.#mask) {
      this.#currentColor = this.#colors[c];
    } else {
      const cmd = c >> this.#planes;
      const val = (c & this.#mask) * this.#scale;

      if (cmd === 1) {
        this.#currentColor = (this.#currentColor & 0xffff00ff) | (val << 8);
      } else if (cmd === 2) {
        this.#currentColor = (this.#currentColor & 0x00ffffff) | (val << 24);
      } else {
        this.#currentColor = (this.#currentColor & 0xff00ffff) | (val << 16);
      }
    }
  }
}