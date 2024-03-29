/*

Control byte meanings:

  For a given control byte, x:

  x < 0   Copy -x of unique words to take from the data section 
          (from 1 to 128)
  x = 0   1 word is taken from the control section which specifies
          the number of times to repeat the next data word (from
          128 to 32767)
  x = 1   1 word is taken from the control section which specifies
          the number of unique words to be taken from the data
          section (from 128 - 32767)
  x > 1   Specifies the number of times to repeat the next word
          taken from the data section (from 2 to 127)
*/

const COMPRESSION_CONTROL_BYTE_REPEAT = 0;
const COMPRESSION_CONTROL_BYTE_COPY = 1;

/**
 * Decompresses Tiny stuff image data
 * 
 * @param {DataView} controlBytes View of control bytes
 * @param {DataView} dataWords View of data bytes
 * @param {ArrayBuffer} outBuffer Array buffer containing the decompressed data
 */
export default (controlBytes, dataWords, outBuffer) => {

  let controlPos = 0;
  let dataPos = 0;
  let count = 0;
  let data_type;
  let data_count;

  const outView = new DataView(outBuffer);

  while (controlPos < controlBytes.byteLength) {
    const controlByte = controlBytes.getInt8(controlPos);

    if (controlByte < 0 || controlByte == 1) {
      data_type = COMPRESSION_CONTROL_BYTE_COPY;
    } else {
      data_type = COMPRESSION_CONTROL_BYTE_REPEAT;
    }

    if (controlByte < 0 || controlByte > 1) {
      data_count = Math.abs(controlByte);
      controlPos++;
    } else {
      data_count = controlBytes.getUint16(controlPos + 1);
      controlPos += 3;
    }

    const end = count + data_count;
    for ( ; count < end; count++)
    {
      const offset = ((((count % 4000) / 200) | 0) * 4 + (count / 4000 | 0) + (80 * (count % 200)));
      outView.setUint16(offset * 2, dataWords.getUint16(dataPos * 2));

      /* if data is being copied advance data pointer after each integer */
      if (data_type == COMPRESSION_CONTROL_BYTE_COPY) {
        dataPos++;
      }
    }
    /* if data was repeated advance data pointer once finished */
    if (data_type == COMPRESSION_CONTROL_BYTE_REPEAT) {
      dataPos++;
    }

  }

};
