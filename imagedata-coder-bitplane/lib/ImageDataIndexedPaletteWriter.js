export default class ImageDataIndexedPaletteWriter {

  #palette;
  #pos;
  #view;

  /**
   * 
   * @param {ImageData} imageData The image data to write to
   * @param {import('./IndexedPalette.js').default} palette The indexed palette to use for resolving colors
   */
  constructor(imageData, palette) {
    this.#pos = 0;
    this.#view = new DataView(imageData.data.buffer);
    this.setPalette(palette);
  }

  write(color) {
    this.#view.setUint32(this.#pos, this.#palette[color]);
    this.#pos += 4;
  }

  setPalette(palette) {
    this.#palette = palette.resample(8).toValueArray();
  }

}
