import ImageDataDrawingContext from './ImageDataDrawingContext.js';
import { registerFont } from './text/fontRegistry.js';

// Register the default font
import pixi from './text/fonts/pixi.js';
registerFont(pixi, ['pixi']);

export default ImageDataDrawingContext;
