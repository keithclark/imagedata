/**
 * @typedef chunk
 * @property {number} start - offset into the buffer for this chunk
 * @property {number} length - the length of the buffer
 */
export class IffChunkWriter {

  /** @type {ArrayBuffer} */
  #buffer;

  /** @type {number} */
  #pos;

  /** @type {DataView} */
  #view;

  /** @type {TextEncoder} */
  #textEncoder;

  /** @type {Array<>} */
  #chunkOffsetStack = [];

  /** @type {{start:number, length:number}?} */
  #currentChunkOffset;

  constructor(buffer) {
    this.#pos = 0;
    this.#textEncoder = new TextEncoder();
    this.#view = new DataView(buffer);
  }

  startChunk(type) {
    this.writeString(type);
    this.writeUint32(0);
    this.#currentChunkOffset = this.#pos;
    this.#chunkOffsetStack.push(this.#currentChunkOffset);
  }

  endChunk() {
    const length = this.#pos - this.#currentChunkOffset;
    this.#view.setUint32(this.#currentChunkOffset - 4, length);
    this.#chunkOffsetStack.pop();
    this.#currentChunkOffset = this.#chunkOffsetStack[this.#chunkOffsetStack.length - 1];
    return length + 8;
  }

  writeChunk(type, buffer) {
    this.writeString(type);
    this.writeLong(buffer.byteLength);
    this.writeBytes(new Uint8Array(buffer));
  }

  writeUint8(value) {
    this.#view.setUint8(this.#pos++, value);
  }

  writeInt8(value) {
    this.#view.setInt8(this.#pos++, value);
  }

  writeUint16(value) {
    this.#view.setUint16(this.#pos, value);
    this.#pos += 2;
  }

  writeInt16(value) {
    this.#view.setInt16(this.#pos, value);
    this.#pos += 2;
  }

  writeUint32(value) {
    this.#view.setUint32(this.#pos, value);
    this.#pos += 4; 
  }

  writeInt32(value) {
    this.#view.setInt32(this.#pos, value);
    this.#pos += 2;
  }

  /**
   * Writes a specified number of bytes to the buffer
   * 
   * @param {Uint8Array} value The bytes to write
   */
  writeBytes(value) {
    for (const byte of value) {
      this.writeUint8(byte);
    }
  }

  writeString(value) {
    return this.writeBytes(this.#textEncoder.encode(value));
  }

  trim() {
    if (this.#pos < this.#buffer.byteLength) {
      this.#buffer = this.#buffer.slice(0, this.#pos);
    }
  }

  get buffer() {
    return this.#buffer;
  }
}
