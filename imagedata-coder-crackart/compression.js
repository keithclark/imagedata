export const decompress = (buffer) => {

  const writeByte = (byte) => {
    location[nextPos] = byte;
    nextPos += offset;
    remaining--;
    if (nextPos >= size) {
      nextStart++;
      nextPos = nextStart;
    }
  };

  const readWord = () => {
    return inView.getUint16(inPos += 2);
  };

  const readByte = () => {
    return inView.getUint8(inPos++);
  };

  const outLength = 32000;
  const inView = new DataView(buffer);
  const escape = inView.getUint8(0);
  const initial = inView.getUint8(1);
  const offset = inView.getInt16(2);
  const location = new Uint8Array(outLength).fill(initial);

  let inPos = 4;
  let size = outLength;
  let remaining = outLength;
  let nextStart = 0;
  let nextPos = 0;

  while (remaining) {
    let length;
    let byte;
    let code = readByte();

    if (code !== escape) {
      writeByte(code);
    } else {
      code = readByte();
      if (code === escape) {
        writeByte(code);
      } else if (code === 0) {
        length = readByte() + 1;
        byte = readByte();
        while (length--) {
          writeByte(byte);
        }
      } else if (code === 1) {
        length = readWord() + 1;
        byte = readByte();
        while (length--) {
          writeByte(byte);
        }
      } else if (code === 2) {
        length = readByte();
        if (length) {
          length <<= 8;
          length += readByte() + 1;
          while (length--) {
            writeByte(initial);
          }
        } else {
          while (remaining) {
            writeByte(initial);
          }
        }
      } else {
        length = code + 1;
        byte = readByte();
        while (length--) {
          writeByte(byte);
        }
      }
    }
  }

  return location.buffer;
};
