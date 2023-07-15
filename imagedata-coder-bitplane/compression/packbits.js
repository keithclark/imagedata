/**
 * Decompresses data encoded with the packbits compression method
 * 
 * @param {ArrayBuffer} buffer A buffer containing the compressed data
 * @param {Number} size The number of bytes to decompress
 * @returns {ArrayBuffer} An array buffer containing the uncompressed data
 */
export const depack = (buffer, size) => {
  const outputBuffer = new ArrayBuffer(size);
  const outView = new DataView(outputBuffer);
  const srcBuffer = new DataView(buffer);
  let srcPos = 0;
  let destPos = 0;

  while (destPos < size) {

    let byte = srcBuffer.getInt8(srcPos++);

    if (byte === -128) {
      // No Op
    } else if (byte < 0) {
      // One byte of data, repeated (1 − n) times in the decompressed output
      const byte2 = srcBuffer.getUint8(srcPos++);
      for (let c = 0; c < 1 - byte; c++) {
        outView.setUint8(destPos++, byte2);
      }
    } else {
      // (1 + n) literal bytes of data
      for (let c = 0; c < 1 + byte; c++) {
        outView.setUint8(destPos++, srcBuffer.getUint8(srcPos++));
      }
    }
  }
  return outputBuffer;
};
