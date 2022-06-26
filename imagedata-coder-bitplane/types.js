/* eslint-disable no-unused-vars */
import { 
  ENCODING_FORMAT_CONTIGUOUS,
  ENCODING_FORMAT_LINE,
  ENCODING_FORMAT_WORD
} from './consts.js';

/**
 * @typedef BitplaneEncodingFormat
 * @type {ENCODING_FORMAT_CONTIGUOUS|ENCODING_FORMAT_LINE|ENCODING_FORMAT_WORD}
 */

/** 
 * @typedef BitplaneEncodingOptions
 * @property {BitplaneEncodingFormat} format - Bitplane encoding format.
 * @property {Number} planes - The number of bitplanes to encode. If omitted the plane count will be determined by the number of colours in the palette.
*/