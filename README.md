# ImageData

An implementation of the W3C ImageData interface for use in JavaScript environments that don't support it natively (everything other than a web browser). 

## Constructor

Creates an ImageData object of a specific width and height filled with black pixels, or from an array of Uint8ClampedArray pixel data. 

#### Syntax

```js
myImageData = new ImageData(width, height)
myImageData = new ImageData(data, width)
myImageData = new ImageData(data, width, height)
```

#### Arguments

Name | Type | Description
-|-|-
`data` | [Uint8ClampedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray) | Byte data representing the RGBA values of the image. Must be a multiple of 4. 
`width` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The image width in pixels. 
`height` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The image height in pixels. 

## Properties

### `colorSpace` (Read only)

A [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) representing the color space of the image data. This property exists for compatability reasons and always returns `srgb`. 

### `data` (Read only)

A [Uint8ClampedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray). An array of color data representing the RGBA values of the image. 

#### Example

```js
 const { data } = myImageData;
 const r = data[0];
 const g = data[1];
 const b = data[2];
 const a = data[3];
```

### `height` (Read only)

A [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) representing the height of the image data in pixels. 

### `width` (Read only)

A [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) representing the width of the image data in pixels. 
