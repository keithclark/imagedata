import ImageData from './ImageData.js';

if (!('ImageData' in globalThis)) {
  globalThis.ImageData = ImageData;
}
