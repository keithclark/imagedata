/** Data is uncompressed */
export const COMPRESSION_NONE = 0;

/** Data is compressed using the Packbits method */
export const COMPRESSION_PACKBITS = 1;

/** Data is compressed using the Atari ST method (VDAT chunks in BODY) */
export const COMPRESSION_ATARI = 2;

/** Image uses the Amiga Extra Half-Brite display mode */
export const AMIGA_MODE_EHB = 0x0080;

/** Image uses the Amiga Hold and Modify display mode */
export const AMIGA_MODE_HAM = 0x0800;

/** Image uses the Amiga high resolution display mode */
export const AMIGA_MODE_HIRES = 0x8000;

/** Image uses the Amiga interlaced display mode */
export const AMIGA_MODE_LACE = 0x0004;

export const IFF_CHUNK_ID_FORM = 'FORM';
export const IFF_CHUNK_ID_ILBM = 'ILBM';
export const IFF_CHUNK_ID_ACBM = 'ACBM';
export const IFF_CHUNK_ID_RAST = 'RAST';
export const IFF_CHUNK_ID_BMHD = 'BMHD';
export const IFF_CHUNK_ID_CAMG = 'CAMG';
export const IFF_CHUNK_ID_CMAP = 'CMAP';
export const IFF_CHUNK_ID_ABIT = 'ABIT';
export const IFF_CHUNK_ID_BODY = 'BODY';
export const IFF_CHUNK_ID_VDAT = 'VDAT';


export const IFF_ENCODING_FORMAT_ILBM = 'ilbm';
export const IFF_ENCODING_FORMAT_ACBM = 'acbm';
