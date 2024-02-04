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


/*
 * Compress data using the packbits compression method
 * 
 * @param {Uint8Array} inputBuffer The uncompressed data
 * @param {Uint8Array} outputBuffer The buffer to write compressed data to
 * @returns {number} The size of the compressed data
 */
export const pack = (inputBuffer, outputBuffer) => {
  const srcLen = inputBuffer.byteLength;
  const outView = new DataView(outputBuffer.buffer);
  const srcView = new DataView(inputBuffer.buffer);
  let srcPos = 0;
  let outPos = 0;

  while (srcPos < srcLen) {

    const thisByte = srcView.getUint8(srcPos);

    // If we're at the end of the source buffer and only have one byte to 
    // encode, we need to write the 0 literal, followed by the byte.
    if (srcPos >= srcLen - 1) {
      outView.setUint8(outPos++, 0);
      outView.setUint8(outPos++, thisByte);
      break;
    }

    // Get the next byte so we can decide what to do
    const nextByte = srcView.getUint8(srcPos + 1);
    let runPos = srcPos + 2;
    let runLength = 2;

    if (nextByte === thisByte) {
      // Repeating byte sequence - encode it
      while (runPos < srcLen && thisByte === srcView.getUint8(runPos) && runLength < 128) {
        runLength++;
        runPos++;
      }
      // Add the header and data bytes
      outView.setInt8(outPos++, 1 - runLength);
      outView.setUint8(outPos++, thisByte);
    } else {

      // uncompressed byte run
      let prev = srcView.getUint8(runPos - 1);
      let repeatCount = 0;
      while (runPos < srcLen && repeatCount < 2 && runLength < 128) {
        if (prev === srcView.getUint8(runPos)) {
          repeatCount++;
        } else {
          repeatCount = 0;
        }
        prev = srcView.getUint8(runPos);
        runPos++;
        runLength++;
      }
      
      // If we ended on a run of identical bytes then we need to move back
      // through the buffer ready for the next pass.
      if (repeatCount >= 2 && runPos < srcLen) {
        runPos -= repeatCount + 1;
        runLength -= repeatCount + 1;
      }

      // Write the header and literal bytes
      outView.setInt8(outPos++, runLength - 1);
      outputBuffer.set(inputBuffer.slice(srcPos, runPos), outPos);
      outPos += runLength;
    }
    srcPos = runPos;
  }

  return outPos;
};
