# ImageDataDrawingContext

## Constructor

Creates a new `ImageDataDrawingContext` instance. 

#### Syntax

```js
myImageDataDrawingContext = new ImageDataDrawingContext(imageData)
```

#### Arguments

Name | Type | Description
-|-|-
`imageData` | ImageData | The `ImageData` object to draw to. 

## Methods

### `beginPath()`

Begins a new sub-path. 

#### Syntax

```js
imageDataDrawingContextInstance.beginPath()
```

### `clearRect()`

Fills a rectangular area of the image with transparent pixels. 

#### Syntax

```js
imageDataDrawingContextInstance.clearRect(x, y, width, height)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate of the rectangle's starting point. 
`y` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate of the rectangle's starting point. 
`width` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The rectangle's width. Positive values are to the right, and negative to the left. 
`height` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The rectangle's height. Positive values are down, and negative are up. 

### `closePath()`

Connects the last point in the current sub-path to the first point. If the last and first points are the same coordinates, this method does nothing. 

#### Syntax

```js
imageDataDrawingContextInstance.closePath()
```

### `drawImage()`

Draws an ImageData onto the image, preserving transparency and with optional scaling. 

#### Syntax

```js
imageDataDrawingContextInstance.drawImage(image, dx, dy)
imageDataDrawingContextInstance.drawImage(image, dx, dy, dWidth, dHeight)
imageDataDrawingContextInstance.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
```

#### Arguments

Name | Type | Description
-|-|-
`image` | ImageData | The image object to draw. 
`dx` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate to place the image in the destination image. Can be negative. 
`dy` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate to place the image in the destination image. Can be negative. 
`dWidth` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The width to draw the source image in the destination image. If omitted, the source image is drawn at its natural width. 
`dHeight` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The height to draw the source image in the destination image. If omitted, the source image is drawn at its natural height. 
`sx` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate of the top-left corner from which the image data will be extracted. Can be negative. Defaults to `0`. 
`sy` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate of the top-left corner from which the image data will be extracted. Can be negative. Defaults to `0`. 
`sWidth` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Width of the source image data to extract. If omitted, the source image is drawn at its natural width. 
`sHeight` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | Height of the source image data to extract. If omitted, the source image is drawn at its natural height. 

### `fill()`

Fills the current path with the current fill style. 

#### Syntax

```js
imageDataDrawingContextInstance.fill()
```

### `fillRect()`

Draws a filled rectangle using the current `fillStyle`. 

#### Syntax

```js
imageDataDrawingContextInstance.fillRect(x, y, width, height)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate of the rectangle's starting point. 
`y` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate of the rectangle's starting point. 
`width` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The rectangle's width. Positive values are to the right, and negative to the left. 
`height` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The rectangle's height. Positive values are down, and negative are up. 

### `fillText()`

Draws the characters of a string at the specified coordinates in the current `fillStyle`. Note: this is identical to `strokeText()`, except that the `fillStyle` is used instead of `strokeStyle`. 

#### Syntax

```js
imageDataDrawingContextInstance.fillText(text, x, y)
```

#### Arguments

Name | Type | Description
-|-|-
`text` | [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | The text to render. 
`x` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate to start drawing the text. 
`y` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate to start drawing the text. 

#### Example

```js
context.fillText("I am filled", 20, 20)
```

### `lineTo()`

Draws a line from the last sub-path point to a new sub-path point at the given coordinates. 

#### Syntax

```js
imageDataDrawingContextInstance.lineTo(x, y)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate of the new point. 
`y` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate of the new point. 

### `measureText()`

Returns a TextMetrics object that contains information about how the given string will be rendered using the current font. 

#### Syntax

```js
result = imageDataDrawingContextInstance.measureText(text)
```

#### Arguments

Name | Type | Description
-|-|-
`text` | [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | The string to measure. 

#### Returns

A TextMetrics reflecting the text metrics of the string. 

### `moveTo()`

Begins a new-sub path at the given coordinates. 

#### Syntax

```js
imageDataDrawingContextInstance.moveTo(x, y)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate of the new point. 
`y` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate of the new point. 

### `putImageData()`

Draws the given source ImageData object onto the underyling ImageData, replacing any destination pixels with the source data. If a dirty rectangle is provided, only the pixels from that rectangle are drawn. 

#### Syntax

```js
imageDataDrawingContextInstance.putImageData(image, dx, dy)
imageDataDrawingContextInstance.putImageData(image, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight)
```

#### Arguments

Name | Type | Description
-|-|-
`image` | ImageData | The ImageData object containing the image to draw. 
`dx` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate to draw the image at. Can be negative. 
`dy` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate to draw the image at. Can be negative. 
`dirtyX` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate to start copying from. Can be negative. Defaults to `0`. 
`dirtyY` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate to start copying from. Can be negative. Defaults to `0`. 
`dirtyWidth` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The number of columns to copy.  Defaults to source image width. 
`dirtyHeight` (Optional) | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The number of rows to copy. Defaults to source image height. 

### `stroke()`

Outlines the current path with the current stroke style. 

#### Syntax

```js
imageDataDrawingContextInstance.stroke()
```

### `strokeRect()`

Draws an outlined rectangle using the current `strokeStyle`. 

#### Syntax

```js
imageDataDrawingContextInstance.strokeRect(x, y, width, height)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate of the rectangle's starting point. 
`y` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate of the rectangle's starting point. 
`width` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The rectangle's width. Positive values are to the right, and negative to the left. 
`height` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The rectangle's height. Positive values are down, and negative are up. 

### `strokeText()`

Draws the characters of a string at the specified coordinates in the current `strokeStyle`. Note: this is identical to `fillText()`, except that the `strokeStyle` is used instead of `fillStyle`. 

#### Syntax

```js
imageDataDrawingContextInstance.strokeText(text, x, y)
```

#### Arguments

Name | Type | Description
-|-|-
`text` | [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | The text to render. 
`x` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The x-axis coordinate to start drawing the text. 
`y` | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | The y-axis coordinate to start drawing the text. 

#### Example

```js
context.strokeText("I have a stroked outline", 20, 20)
```

## Properties

### `fillStyle`

A [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String). Color to use when filling shapes. 

#### Example

```js
 context.fillStyle = "red";
 context.fillStyle = "#f0f";
 context.fillStyle = "rgba(255,0,255,.5)";
 context.fillStyle = "hsl(255,50%,50%)";
```

### `font`

A [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) reflecting the font to use when rendering text. 

#### Example

```js
context.font = "pixi"
```

### `letterSpacing`

A [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String). Get or set the spacing between letters when rendering text. 

#### Example

```js
context.letterSpacing = "1.5px";
```

### `strokeStyle`

A [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String). Color to use when outlining shapes. 

#### Example

```js
 context.strokeStyle = "orange";
 context.strokeStyle = "#ff0000";
 context.strokeStyle = "rgb(255,0,255,.5)";
 context.strokeStyle = "hsla(255 50% 50% / .5)";
```

### `wordSpacing`

A [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String). Get or set the spacing between words when rendering text. 

#### Example

```js
context.wordSpacing = "3px";
```