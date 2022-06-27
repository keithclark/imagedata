/**
 * @typedef {Object} Font
 * @property {'bitmap'} type - The type of the font
 * @property {Number} baseHeight - The base height of the font
 * @property {Object<String,Glpyh>} glpyhs - The glpyhs of the font
 */

/**
 * @typedef {Object} Glpyh
 * @property {Number} vOffset - The vertical offset of the glyph
 * @property {Number} width - The width of the glyph
 * @property {Array<Number>} data - The binary data for each row of the glyph
 */

/** @type {Map<String,Font>} */
const registeredFonts = new Map();


/**
 * Registers a font for use with `ImageDataDrawingContext` objects
 * 
 * @param {Font} font - The font to register
 * @param {Array<String>} aliases - The font name aliases
 */
export const registerFont = (font, aliases = []) => {
  registeredFonts.set(font.name, font);
  aliases.forEach(family => {
    registeredFonts.set(family, font);
  });
};


/**
 * Retreives a font registerd for use with `ImageDataDrawingContext` objects
 * 
 * @param {String} fontName - The name of the font to retrieve
 * @returns {Font|null} The font or `null` if the font isn't registered
 */
export const getFontByFamily = (fontName) => {
  return registeredFonts.get(fontName) || null;
};


/**
 * Retreives the default font (the first registered font)
 * 
 * @returns {Font} The default font
 */
export const getDefaultFont = () => {
  return registeredFonts.values().next().value || null;
};
