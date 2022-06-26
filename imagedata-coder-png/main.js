import ImageData from 'imagedata';
import { PNG } from 'pngjs';
import { Blob } from 'buffer';

/**
 * Decodes a buffer containing a PNG into ImageData
 * 
 * @param {ArrayBuffer} buffer - The buffer containing the image to decode
 * @returns {Promise<ImageData>} Image data for the image
 */
export const decode = buffer => new Promise((resolve, reject) => {
  const png = new PNG();
  png.parse(buffer, (err, pngData) => {
    if (err) {
      reject(err);
    } else {
      const { width, height, data } = pngData;
      const imageData = new ImageData(Uint8ClampedArray.from(data), width, height);
      resolve(imageData);
    }
  });
});


/**
 * Encodes ImageData to PNG
 * 
 * @param {ImageData} imageData - The data to encode 
 * @returns {Promise<ArrayBuffer>} A buffer containing the PNG data
 */
export const encode = imageData => new Promise((resolve, reject) => {
  const buffers = [];
  const png = new PNG({ width: imageData.width, height: imageData.height });
  png.data = imageData.data;
  png.on('data', buffer => buffers.push(buffer));
  png.on('error', reject);
  png.on('end', () => new Blob(buffers).arrayBuffer().then(resolve));
  png.pack();
});
