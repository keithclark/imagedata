export default class ImageDataIndexedPaletteReader {

  #palette;
  #pos;
  #view;

  /**
   * 
   * @param {ImageData} imageData The image data to read from
   * @param {import('./IndexedPalette.js').default} palette The indexed palette to use for resolving colors
   */
  constructor(imageData, palette) {
    this.#pos = 0;
    this.#view = new DataView(imageData.data.buffer);
    this.setPalette(palette);
  }

  read() {
    const color = this.#view.getUint32(this.#pos);
    const index = this.#palette.indexOf(color);
    if (index === -1) {
      throw new RangeError(`Color 0x${color.toString(16)} not in palette`);
    }
    this.#pos += 4;
    return index;
  }

  /**
   * Moves the reader forward by a specified number of pixels. Useful for 
   * clipping data.
   * @param {number} pixels The number of pixels to skip over
   */
  advance(pixels) {
    this.#pos += 4 * pixels;
  }

  setPalette(palette) {
    this.#palette = palette.resample(8).toValueArray();
  }

  eof() {
    return this.#pos === this.#view.byteLength;
  }
}
