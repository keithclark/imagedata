/**
 * Decompresses data encoded with the packbits compression method
 * 
 * @param {ArrayBufffer} buffer A buffer containing the compressed data
 * @param {Number} size The number of bytes to decompress
 * @returns {ArrayBufffer} An array buffer containing the uncompressed data
 */
export const depack = (buffer, size) => {
  const outputBuffer = new ArrayBuffer(size);
  const outView = new DataView(outputBuffer);
  const srcBuffer = new DataView(buffer);
  let srcPos = 0;
  let destPos = 0;

  while (destPos < size) {

    let byte = srcBuffer.getInt8(srcPos++);

    if (byte < 0) {
      const byte2 = srcBuffer.getUint8(srcPos++);
      for (let c = 0;c < 1 - byte;c++) {
        outView.setUint8(destPos++, byte2);
      }
      // -1 to -127 -> one byte of data repeated (1 - byte) times
    } else {
      for (let c = 0; c < 1 + byte; c++) {
        outView.setUint8(destPos++, srcBuffer.getUint8(srcPos++));
      }
    }
  }
  return outputBuffer;
};
