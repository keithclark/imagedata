
# ImageDataDrawingContext



## Constructor

### `ImageDataDrawingContext()`

Creates a new `ImageDataDrawingContext` instance. 

#### Syntax

```js
 new ImageDataDrawingContext(imageData)
```

#### Arguments

Name | Type | Description
-|-|-
imageData | [ImageData](#) | The `ImageData` object to draw to

## Properties

### `fillStyle`

A [String](#). Color to use when filling shapes. 

#### Examples

```js
context.fillStyle = "red";
context.fillStyle = "#f0f";
context.fillStyle = "rgba(255,0,255,.5)";
context.fillStyle = "hsl(255,50%,50%)";
```

### `font`

A [String](#) reflecting the font to use when rendering text. 

#### Example

```js
context.font = "pixi"
```

### `letterSpacing`

A [String](#). Get or set the spacing between letters when rendering text. 

#### Example

```js
context.letterSpacing = "1.5px";
```

### `strokeStyle`

A [String](#). Color to use when outlining shapes. 

#### Examples

```js
context.fillStyle = "orange";
context.fillStyle = "#ff0000";
context.fillStyle = "rgb(255,0,255,.5)";
context.fillStyle = "hsla(255 50% 50% / .5)";
```

### `wordSpacing`

A [String](#). Get or set the spacing between words when rendering text. 

#### Example

```js
context.wordSpacing = "3px";
```

## Methods

### `beginPath()`

Begins a new sub-path. 

```js
myImageDataDrawingContext.beginPath()
```

### `clearRect()`

Fills a rectangular area of the image with transparent pixels. 

```js
myImageDataDrawingContext.clearRect(x, y, width, height)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [Number](#) | The x-axis coordinate of the rectangle's starting point. 
`y` | [Number](#) | The y-axis coordinate of the rectangle's starting point. 
`width` | [Number](#) | The rectangle's width. Positive values are to the right, and negative to the left. 
`height` | [Number](#) | The rectangle's height. Positive values are down, and negative are up. 

### `closePath()`

Connects the last point in the current sub-path to the first point. If the last and first points are the same coordinates, this method does nothing. 

```js
myImageDataDrawingContext.closePath()
```

### `drawImage()`

Draws an ImageData onto the image, preserving transparency and with optional scaling. 

```js
myImageDataDrawingContext.drawImage(image, dx, dy)
myImageDataDrawingContext.drawImage(image, dx, dy, dWidth, dHeight)
myImageDataDrawingContext.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
```

#### Arguments

Name | Type | Description
-|-|-
`image` | [ImageData](#) | The image object to draw. 
`sx` | [Number](#) | The x-axis coordinate of the top-left corner from which the image data will be extracted. Can be negative. Defaults to `0`. 
`sy` | [Number](#) | The y-axis coordinate of the top-left corner from which the image data will be extracted. Can be negative. Defaults to `0`. 
`sWidth` | [Number](#) | Width of the source image data to extract. If omitted, the source image is drawn at its natural width. 
`sHeight` | [Number](#) | Height of the source image data to extract. If omitted, the source image is drawn at its natural height. 
`dx` | [Number](#) | The x-axis coordinate to place the image in the destination image. Can be negative. 
`dy` | [Number](#) | The y-axis coordinate to place the image in the destination image. Can be negative. 
`dWidth` | [Number](#) | The width to draw the source image in the destination image. If omitted, the source image is drawn at its natural width. 
`dHeight` | [Number](#) | The height to draw the source image in the destination image. If omitted, the source image is drawn at its natural height. 

### `fill()`

Fills the current path with the current fill style. 

```js
myImageDataDrawingContext.fill()
```

### `fillRect()`

Draws a filled rectangle using the current `fillStyle`. 

```js
myImageDataDrawingContext.fillRect(x, y, width, height)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [Number](#) | The x-axis coordinate of the rectangle's starting point. 
`y` | [Number](#) | The y-axis coordinate of the rectangle's starting point. 
`width` | [Number](#) | The rectangle's width. Positive values are to the right, and negative to the left. 
`height` | [Number](#) | The rectangle's height. Positive values are down, and negative are up. 

### `fillText()`

Draws the characters of a string at the specified coordinates in the current `fillStyle`. Note: this is identical to `strokeText()`, except that the `fillStyle` is used instead of `strokeStyle`. 

```js
myImageDataDrawingContext.fillText(text, x, y)
```

#### Arguments

Name | Type | Description
-|-|-
`text` | [String](#) | The text to render. 
`x` | [Number](#) | The x-axis coordinate to start drawing the text. 
`y` | [Number](#) | The y-axis coordinate to start drawing the text. 

#### Example

```js
context.fillText("I am filled", 20, 20)
```

### `lineTo()`

Draws a line from the last sub-path point to a new sub-path point at the given coordinates. 

```js
myImageDataDrawingContext.lineTo(x, y)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [Number](#) | The x-axis coordinate of the new point. 
`y` | [Number](#) | The y-axis coordinate of the new point. 

### `measureText()`

Returns a TextMetrics object that contains information about how the given string will be rendered using the current font. 

```js
myImageDataDrawingContext.measureText(text)
```

#### Arguments

Name | Type | Description
-|-|-
`text` | [string](#) | The string to measure. 

#### Returns
A [TextMetrics](#) reflecting the text metrics of the string. 
### `moveTo()`

Begins a new-sub path at the given coordinates. 

```js
myImageDataDrawingContext.moveTo(x, y)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [Number](#) | The x-axis coordinate of the new point. 
`y` | [Number](#) | The y-axis coordinate of the new point. 

### `putImageData()`

Draws the given source ImageData object onto the underyling ImageData, replacing any destination pixels with the source data. If a dirty rectangle is provided, only the pixels from that rectangle are drawn. 

```js
myImageDataDrawingContext.putImageData(image, dx, dy)
myImageDataDrawingContext.putImageData(image, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight)
```

#### Arguments

Name | Type | Description
-|-|-
`image` | [ImageData](#) | The ImageData object containing the image to draw. 
`dx` | [Number](#) | The x-axis coordinate to draw the image at. Can be negative. 
`dy` | [Number](#) | The y-axis coordinate to draw the image at. Can be negative. 
`dirtyX` | [Number](#) | The x-axis coordinate to start copying from. Can be negative. Defaults to `0`. 
`dirtyY` | [Number](#) | The y-axis coordinate to start copying from. Can be negative. Defaults to `0`. 
`dirtyWidth` | [Number](#) | The number of columns to copy.  Defaults to source image width. 
`dirtyHeight` | [Number](#) | The number of rows to copy. Defaults to source image height. 

### `stroke()`

Outlines the current path with the current stroke style. 

```js
myImageDataDrawingContext.stroke()
```

### `strokeRect()`

Draws an outlined rectangle using the current `strokeStyle`. 

```js
myImageDataDrawingContext.strokeRect(x, y, width, height)
```

#### Arguments

Name | Type | Description
-|-|-
`x` | [Number](#) | The x-axis coordinate of the rectangle's starting point. 
`y` | [Number](#) | The y-axis coordinate of the rectangle's starting point. 
`width` | [Number](#) | The rectangle's width. Positive values are to the right, and negative to the left. 
`height` | [Number](#) | The rectangle's height. Positive values are down, and negative are up. 

### `strokeText()`

Draws the characters of a string at the specified coordinates in the current `strokeStyle`. Note: this is identical to `fillText()`, except that the `strokeStyle` is used instead of `fillStyle`. 

```js
myImageDataDrawingContext.strokeText(text, x, y)
```

#### Arguments

Name | Type | Description
-|-|-
`text` | [String](#) | The text to render. 
`x` | [Number](#) | The x-axis coordinate to start drawing the text. 
`y` | [Number](#) | The y-axis coordinate to start drawing the text. 

#### Example

```js
context.strokeText("I have a stroked outline", 20, 20)
```
