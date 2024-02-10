import { LineInterleavedBitplaneReader } from 'imagedata-coder-bitplane';

const SCALE = 255 / 16;

/**
 * Provides an interface for reading pixel data from a Amiga HAM encoded planar 
 * image.
 */
export default class HamReader extends LineInterleavedBitplaneReader {

  #colors;
  #currentColor;

  constructor(buffer, width, palette) {
    super(buffer, 6, width);
    this.#colors = palette.toValueArray();
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
    if (c < 16) {
      this.#currentColor = this.#colors[c];
    } else {
      const cmd = c >> 4;
      const val = (c & 0xf) * SCALE;

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