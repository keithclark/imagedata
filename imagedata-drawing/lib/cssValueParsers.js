import { rgbaToUint32, hslaToUint32 } from './colorUtils.js';
import CSS_NAMED_COLORS from '../cssNamedColors.js';

const RE_RGB_COLOR_SYNTAX = /^rgb\(\s*((?:\d*\.)?\d+%?)\s*,\s*((?:\d*\.)?\d+%?)\s*,\s*((?:\d*\.)?\d+%?)\s*\)$/;
const RE_RGBA_COLOR_SYNTAX = /^rgba\(\s*((?:\d*\.)?\d+%?)\s*,\s*((?:\d*\.)?\d+%?)\s*,\s*((?:\d*\.)?\d+%?)\s*,\s*((?:\d*\.)?\d+%?)\s*\)$/;

const RE_HSL_COLOR_SYNTAX = /^hsl\(\s*((?:\d*\.)?\d+?(?:deg|rad)?)?\s*,\s*((?:\d*\.)?\d+%)\s*,\s*((?:\d*\.)?\d+%)\s*\)$/;
const RE_HSLA_COLOR_SYNTAX = /^hsla\(\s*((?:\d*\.)?\d+?(?:deg|rad)?)?\s*,\s*((?:\d*\.)?\d+%)\s*,\s*((?:\d*\.)?\d+%)\s*,\s*((?:\d*\.)?\d+%?)\s*\)$/;

const RE_HEX3_COLOR_SYNTAX = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/;
const RE_HEX4_COLOR_SYNTAX = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/;
const RE_HEX6_COLOR_SYNTAX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/;
const RE_HEX8_COLOR_SYNTAX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/;


/**
 * Converts a CSS `<number>` to a `Number`
 * 
 * @param {String} value - The value to parse
 * @param {Number} [min=0] - The minimum value allowed
 * @param {Number} [max=1] - The maximum value allowed
 * @returns {Number} The converted number
 * @example parseClampedNumber(.4, 0, 1); // returns `.4`
 * @example parseClampedNumber(280, 0, 255); // returns `255`
 */
export const parseClampedNumber = (value, min = 0, max = 1) => {
  return Math.max(min, Math.min(parseFloat(value), max));
};


/**
 * Converts a CSS `<percentage>` to a `Number` between `0` and `1`.
 * 
 * @param {String} value - The value to parse
 * @returns {Number} The converted number
 * @example parsePercentage(50); // returns `.5`
 * @example parsePercentage(175); // returns `1`
 */
export const parsePercentage = (value) => {
  return parseClampedNumber(value, 0, 100) / 100;
};


/**
 * Converts a CSS `<angle>` to a `Number`. The angle can be specified with `rad`
 * or `deg` unit. The resulting number is in radians.
 * 
 * @param {String} value - The value to parse
 * @returns {Number} The converted angle in radians
 * @example parseAngle('180deg'); // returns `3.14159`
 * @example parseAngle('2rad'); // returns `2`
 */
export const parseAngle = (value) => {
  if (value.endsWith('rad')) {
    return parseFloat(value);
  }
  if (value.endsWith('deg')) {
    value = value.slice(0, -3);
  }
  return parseFloat(value) * (Math.PI / 180);
};


/**
 * Converts a CSS `<percent>` or `<number>` value to a `Number`, clamping it to
 * a specified range.
 * 
 * @param {String} value - The value to parse
 * @param {Number} [min=0] - The minimum value allowed
 * @param {Number} [max=1] - The maximum value allowed
 * @returns {Number} The converted number
 * @example parseNumberOrPercentage('50%', 0, 250); // returns `125`
 * @example parseNumberOrPercentage('50', 0, 255); // returns `50`
 */
export const parseNumberOrPercentage = (value, min = 0, max = 1) => {
  if (value.endsWith('%')) {
    return max * parsePercentage(value);
  } else {
    return parseClampedNumber(value, min, max);
  }
};


/**
 * Converts a CSS color in hex notation, `rgb()`, `rgba()` `hsl()` or `hsla()` 
 * syntax. Returns `null` if the passed color is invalid.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} the color as an unsigned 32 bit integer or `null`
 * @example parseColor('hsl(0deg,50%,50%)'); // returns `0xff0000ff`
 * @example parseColor('rgb(255,255,0)'); // returns `0xffff00ff`
 * @example parseColor('0xf0f'); // returns `0xff00ffff`
 * @example parseColor('0xf0f8'); // returns `0xff00ff88`
 */
export const parseColor = (value) => {
  return parseNamedColor(value) ??
    parseRgbColor(value) ?? 
    parseRgbaColor(value) ?? 
    parseHslColor(value) ??
    parseHslaColor(value) ??
    parseRgbHex4Color(value) ??
    parseRgbaHex4Color(value) ??
    parseRgbHex8Color(value) ??
    parseRgbaHex8Color(value);
};


/**
 * Converts a named CSS color to an unsigned 32 bit `Number`. If the passed name
 * isn't valid, `null` will be returned.
 * 
 * @param {String} value - The named color
 * @returns {Number|null} The color as an unsigned 32 bit integer or `null`
 */
export const parseNamedColor = (value) => {
  if (value in CSS_NAMED_COLORS) {
    return CSS_NAMED_COLORS[value] >>> 0;
  }
  return null;
};


/**
 * Converts a color value from `rgb(r,b,g)` syntax to an unsigned 32 bit 
 * integer value. The `r`, `g` and `b` components can be a CSS `<number>` 
 * between `0` and `255` or a `<percentage>`. The RGB components must use 
 * identical units. Values outside the  expected range will be clamped. If the 
 * passed value isn't valid, `null` will be returned.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} The color as an unsigned 32 bit integer or `null`
 */
export const parseRgbColor = (value) => {
  const match = RE_RGB_COLOR_SYNTAX.exec(value);

  if (!match) {
    return null;
  }

  const [r, g, b] = match.slice(1, 4);

  // Values for R, G and B are only valid if they all use the same unit. Here 
  // we check for percentage values and scale them to 0 - 255.
  if (r.endsWith('%') && g.endsWith('%') && b.endsWith('%')) {
    return rgbaToUint32(
      parsePercentage(r) * 255,
      parsePercentage(g) * 255,
      parsePercentage(b) * 255,
      255
    );
  }

  // Here we check for number values. Again, all values must use the same unit
  // or the color is invalid. R, G and B values are clamped between 0 and 255.
  if (!r.endsWith('%') && !g.endsWith('%') && !b.endsWith('%')) {
    return rgbaToUint32(
      parseClampedNumber(r, 0, 255),
      parseClampedNumber(g, 0, 255),
      parseClampedNumber(b, 0, 255),
      255
    );
  }

  // The color syntax matched the regexp but the values didn't work out as 
  // valid, so we return `null`.
  return null;
};


/**
 * Converts a color value from `rgba(r,b,g,a)` syntax to an unsigned 32 bit 
 * integer. The `r`, `g` and `b` components can be a CSS `<number>`  between `0` 
 * and `255` or a `<percentage>`. The RGB components must use  identical units. 
 * The `a` component can be a `<number>` between `0` and `1`, with `1` resolving 
 * to `100%`, or a `<percentage>`. 
 * 
 * Values outside the expected range will be clamped. If the passed value isn't 
 * valid, `null` will be returned.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} the color as an unsigned 32 bit integer or `null`
 */
export const parseRgbaColor = (value) => {
  const match = RE_RGBA_COLOR_SYNTAX.exec(value);

  if (!match) {
    return null;
  }

  const [r, g, b, a] = match.slice(1, 5);

  // Values for R, G and B are only valid if they use the same units. Here we
  // check for percentage values. The alpha channel can be a number or a
  // percentage.
  if (r.endsWith('%') && g.endsWith('%') && b.endsWith('%')) {
    return rgbaToUint32(
      parsePercentage(r) * 255,
      parsePercentage(g) * 255,
      parsePercentage(b) * 255,
      parseNumberOrPercentage(a, 0, 1) * 255
    );
  }

  // Here we check for decimal values.
  if (!r.endsWith('%') && !g.endsWith('%') && !b.endsWith('%')) {
    return rgbaToUint32(
      parseClampedNumber(r, 0, 255),
      parseClampedNumber(g, 0, 255),
      parseClampedNumber(b, 0, 255),
      parseNumberOrPercentage(a, 0, 1) * 255
    );
  }

  return null;
};


/**
 * Converts a color value from `hsl(h,s,l)` syntax to an unsigned 32 bit 
 * integer. The `h` (hue) value can be an `<angle>` defined in radians, using 
 * the `rad` unit, or in degrees, using the `deg` unit. The `h` component can 
 * also be a `<number>`. In this case the value will be treated as degrees. 
 * 
 * The `s` (saturation) and `l` (lightness) components are `<percentage>` values.
 * 
 * Values outside the  expected range will be clamped. If the passed value isn't 
 * valid, `null` will be returned.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} the color as an unsigned 32 bit integer or `null`
 */
export const parseHslColor = (value) => {
  const match = RE_HSL_COLOR_SYNTAX.exec(value);

  if (!match) {
    return null;
  }

  const [h, s, l] = match.slice(1, 4);

  return hslaToUint32(
    parseAngle(h),
    parsePercentage(s),
    parsePercentage(l),
    1
  );
};


/**
 * Converts a color value from `hsla(h,s,l,a)` syntax to an unsigned 32 bit 
 * integer. The `h` (hue) value can be an `<angle>` defined in radians,  using 
 * the `rad` unit, or in degrees, using the `deg` unit. The `h` component can 
 * also be a `<number>`. In this case the value will be treated as degrees. 
 * 
 * The `s` (saturation) and `l` (lightness) components are `<percentage>` values.
 * 
 * The `a` (alpha) channel can be a `<number>` between `0` and `1`, or a 
 * `<percentage>`.
 * 
 * Values outside the  expected range will be clamped. If the passed value isn't 
 * valid, `null` will be returned.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} the color as an unsigned 32 bit integer or `null`
 */
export const parseHslaColor = (value) => {
  const match = RE_HSLA_COLOR_SYNTAX.exec(value);

  if (!match) {
    return null;
  }

  const [h, s, l, a] = match.slice(1, 5);

  return hslaToUint32(
    parseAngle(h),
    parsePercentage(s),
    parsePercentage(l),
    parseNumberOrPercentage(a, 0, 1)
  );
};


/**
 * Converts a color value from `#rgb` hex notation to an unsigned 32 bit  
 * integer. The `r`, `g` and `b` channel values are multiplied by `0x11` to 
 * scale them to `0` to `255`. If the passed value isn't valid, `null` will be 
 * returned.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} the color as an unsigned 32 bit integer or `null`
 */
export const parseRgbHex4Color = (value) => {
  const match = RE_HEX3_COLOR_SYNTAX.exec(value);

  if (!match) {
    return null;
  }

  const [r, g, b] = match.slice(1, 4);

  return rgbaToUint32(
    parseInt(r, 16) * 0x11,
    parseInt(g, 16) * 0x11,
    parseInt(b, 16) * 0x11,
    255
  );
};


/**
 * Converts a color value from `#rgba` hex notation to an unsigned 32 bit  
 * integer. The `r`, `g`, `b` and `a` channel values are multiplied by `0x11` to
 * scale them to `0` to `255`. If the passed value isn't valid, `null` will be 
 * returned.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} the color as an unsigned 32 bit integer or `null`
 */
export const parseRgbaHex4Color = (value) => {
  const match = RE_HEX4_COLOR_SYNTAX.exec(value);

  if (!match) {
    return null;
  }

  const [r, g, b, a] = match.slice(1, 5);

  return rgbaToUint32(
    parseInt(r, 16) * 0x11,
    parseInt(g, 16) * 0x11,
    parseInt(b, 16) * 0x11,
    parseInt(a, 16) * 0x11,
  );
};


/**
 * Converts a color value from `#rrggbb` hex notation to an unsigned 32 bit  
 * integer. If the passed value isn't valid, `null` will be returned.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} the color as an unsigned 32 bit integer or `null`
 */
export const parseRgbHex8Color = (value) => {
  const match = RE_HEX6_COLOR_SYNTAX.exec(value);

  if (!match) {
    return null;
  }

  const [r, g, b] = match.slice(1, 4);

  return rgbaToUint32(
    parseInt(r, 16),
    parseInt(g, 16),
    parseInt(b, 16),
    255
  );
};


/**
 * Converts a color value from `#rrggbbaa` hex notation to an unsigned 32 bit  
 * integer. If the passed value isn't valid, `null` will be returned.
 * 
 * @param {String} value - The CSS color value to parse
 * @returns {Number|null} the color as an unsigned 32 bit integer or `null`
 */
export const parseRgbaHex8Color = (value) => {
  const match = RE_HEX8_COLOR_SYNTAX.exec(value);

  if (!match) {
    return null;
  }

  const [r, g, b, a] = match.slice(1, 5);

  return rgbaToUint32(
    parseInt(r, 16),
    parseInt(g, 16),
    parseInt(b, 16),
    parseInt(a, 16)
  );
};
