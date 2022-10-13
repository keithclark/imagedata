export default class TextWalker {

  #text;
  #style;

  constructor(text, style) {
    this.#text = text;
    this.#style = style;
  }

  walk(fn) {
    const {
      font,
      wordSpacing,
      letterSpacing
    } = this.#style;

    if (!font || !this.#text) {
      return false;
    }

    const chars = new String(this.#text);  
    let char = chars[0];
    let glyph = font.getGlyph(char);
    for (let c = 1; c < chars.length; c++) {
      const nextChar = chars[c];
      const nextGlyph = font.getGlyph(nextChar);
      const kerning = glyph.kerning && glyph.kerning[nextChar] || 0;

      if (char !== ' ' && nextChar === ' ') {
        fn(glyph, wordSpacing + 1 + kerning);
      } else {
        fn(glyph, letterSpacing + 1 + kerning);
      }
      glyph = nextGlyph;
      char = nextChar;
    }

    fn(glyph, 0);
  }
}
