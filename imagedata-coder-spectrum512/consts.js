export const SPECTRUM_FILE_HEADER = 0x53500000;

export const SPECTRUM_UNCOMPRESSED_FILE_SIZE = 51104;

export const IMAGE_HEIGHT = 199;

export const IMAGE_WIDTH = 320;

export const PALETTES_PER_SCANLINE = 3;

export const COLORS_PER_SCANLINE = PALETTES_PER_SCANLINE * 16;

export const ERROR_MESSAGE_INVALID_FILE_FORMAT = 'Invalid file format';

/** Image is not compressed */
export const COMPRESSION_METHOD_NONE = 0;

/** Standard compression format */
export const COMPRESSION_METHOD_COMPRESSED = 1;

/** "Smooshed" compression format with image stored as contiguous bitplanes (same as SPC) */
export const COMPRESSION_METHOD_SMOOSHED = 2;

/** "Smooshed" compression format with data stored as byte-wide vertical strips */
export const COMPRESSION_METHOD_SMOOSHED_VERTICAL = 3;
