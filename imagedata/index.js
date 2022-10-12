import ImageData from './ImageData.js';

// eslint-disable-next-line no-undef
export default (typeof window === 'object' && 'ImageData' in window) ? window.ImageData : ImageData;
