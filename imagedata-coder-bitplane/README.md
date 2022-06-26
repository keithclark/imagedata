# ImageData bitplane coder

Encodes ImageData into bitplane format.

## Install
```
npm i imagedata-coder-bitplane
```

## `encode()`

### Usage

```js
bitplaneData = await encode(imageData, palette, options);
```

#### Arguments
Name | Type | Description
-|-|-
`imageData` | ImageData | Image width must be a multiple of 16
`palette` | Uint32Array | Image palette
`options` | Object | See blow


#### Options

Name | Description
-|-
`format` | The bitplane encoding format. (`word` (default), `line` or `contiguous`)
`planes` | Number of bitplanes to encode. If not set, the value will be determined by the palette size


#### Formats
* `word` encodes 16 bits of each bitplane (Atari ST). 
* `line` encodes one scanline of each bitplane, interleaving them (Amiga ILBM).
* `contiguous` encodes each complete bitplane, one after the other (Amiga ACBM)


### Example
```js
import { encode } from 'imagedata-coder-bitplane';

const imageData = new ImageData(320, 200);

const palette = new Uint32Array(0x00000000, 0xffffffff, 0xffff00ff, 0xff00ffff);

const bitplaneData = await encode(imageData, palette, { format: 'contiguous' });

await writeFile('image.dat', bitplaneData);
```