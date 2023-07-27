# `ImageData`

A collection of packages for working with images in JavaScript environments that don't implement the `ImageData` interface.

## Example

Here we're loading a NEOchrome image and converting it to PNG.

```js
import imagedata from 'imagedata';
import { decode } from 'imagedata-coder-neochrome';
import { encode } from 'imagedata-coder-png';
import { readFile, writeFile } from 'fs/promises';

// Load a NEO image
const srcImage = await readFile('my-image.neo');

// Decode NEO file into ImageData and return its indexed palette
const { imageData, palette } = await decode(srcImage.buffer);

// Encode the ImageData to PNG format
const outBuffer = await encode(imageData);

// Save the file
await writeFile(destFilepath, Buffer.from(outBuffer));
```

## Packages

* `imagedata` - Implementation of the [`ImageData` interface](https://html.spec.whatwg.org/multipage/canvas.html#dom-imagedata-dev)
* `imagedata-coder-bitplane` - Convert from/to bitplane format
* `imagedata-coder-crackart` - Decode Atari ST Crack Art images
* `imagedata-coder-degas` - Encode / decode Atari ST [Degas](https://en.wikipedia.org/wiki/DEGAS_(software)) images
* `imagedata-coder-iff` - Decode Amiga [IFF](https://en.wikipedia.org/wiki/Interchange_File_Format) images.
* `imagedata-coder-neochrome` - Encode / decode Atari ST [NEOchrome](https://en.wikipedia.org/wiki/NEOchrome) images
* `imagedata-coder-png` - Ecode / decode [PNG](https://en.wikipedia.org/wiki/Portable_Network_Graphics) images. Uses [pngjs](https://github.com/lukeapage/pngjs).
* `imagedata-coder-spectrum512` - Decode Atari ST [Spectrum 512](http://www.atarimania.com/utility-atari-st-spectrum-512_22312.html) images
* `imagedata-drawing` - Provides a context, similar to `CanvasRendingContext2D` for drawing graphics to `ImageData` objects
