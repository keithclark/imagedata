/**
 * Converts hue, saturation, lightness and alpha components to an unsigned 32
 * bit number.
 * 
 * @param {Number} h - The hue angle, in radians
 * @param {Number} s - The saturation value (`0` - `1`)
 * @param {Number} l - The lightness value (`0` - `1`)
 * @param {Number} a - The alpha value (`0` - `1`) 
 * @returns {Number} The color
 */
export const hslaToUint32 = (h, s, l, a) => {
  h *= 180 / Math.PI;
  const k = n => (n + h / 30) % 12;
  const z = s * Math.min(l, 1 - l);
  const f = n => l - z * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (255 * f(0) << 24) + (255 * f(8) << 16) + (255 * f(4) << 8) + (255 * a) >>> 0;
};


/**
 * Converts red, green, blue and alpha components to an unsigned 32 bit number.
 * 
 * @param {Number} r - The red component value (`0` - `255`)
 * @param {Number} g - The green component value (`0` - `255`)
 * @param {Number} b - The blue component value (`0` - `255`)
 * @param {Number} a - The alpha value (`0` - `255`) 
 * @returns {Number} The color
 */
export const rgbaToUint32 = (r, g, b, a) => {
  /*
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  a = Math.min(255, Math.max(0, a));
  */
  return (r << 24) + (g << 16) + (b << 8) + a >>> 0;
};
