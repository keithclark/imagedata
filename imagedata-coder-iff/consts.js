/** IFF chunk identifier */
export const CHUNK_ID_FORM = 0x464f524d;

/** Interlaced bitmap chunk identifier */
export const CHUNK_ID_ILBM = 0x494c424d;

/** Contiguous bitmap chunk identifier */
export const CHUNK_ID_ACBM = 0x4143424d;

/** Bitmap header chunk identifier */
export const CHUNK_ID_BMHD = 0x424d4844;

/** Colour palette chunk identifier */
export const CHUNK_ID_CMAP = 0x434d4150;

/** Amiga display mode chunk identifier */
export const CHUNK_ID_CAMG = 0x43414d47;

/** ILBM image body chunk identifier */
export const CHUNK_ID_BODY = 0x424f4459;

/** ACBM bitmap data chunk identifier */
export const CHUNK_ID_ABIT = 0x41424954;

/** Data is uncompressed */
export const COMPRESSION_NONE = 0;

/** Data uses Packbits compression */
export const COMPRESSION_PACKBITS = 1;

/** Amiga Extra Half-Brite mode */
export const AMIGA_MODE_EHB = 0x80;
