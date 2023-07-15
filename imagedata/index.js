import ImageData from './ImageData.js';

// eslint-disable-next-line no-undef
export default (typeof self === 'object' && 'ImageData' in self) ? self.ImageData : ImageData;
