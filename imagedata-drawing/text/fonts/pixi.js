import Font from '../../interfaces/Font.js';

export default new Font({
  name: 'pixi',
  type: 'bitmap',
  baseHeight: 5,
  glyphs: {
    '!': {
      vOffset: -2,
      width: 1,
      data: [
        0b1,
        0b1,
        0b1,
        0b1,
        0b1,
        0b0,
        0b1
      ]
    },
    '"': {
      vOffset: -2,
      width: 3,
      data: [
        0b101,
        0b101,
      ]
    },
    '#': {
      vOffset: -1,
      width: 5,
      data: [
        0b01010,
        0b11111,
        0b01010,
        0b11111,
        0b01010,
      ]
    },
    '$': {
      vOffset: -2,
      width: 5,
      data: [
        0b00100,
        0b01110,
        0b10100,
        0b01110,
        0b00101,
        0b01110,
        0b00100,
      ]
    },
    '%': {
      vOffset: -1,
      width: 5,
      data: [
        0b10001,
        0b00010,
        0b00100,
        0b01000,
        0b10001,
      ]
    },
    '&': {
      vOffset: -2,
      width: 6,
      data: [
        0b011000,
        0b100100,
        0b101000,
        0b010000,
        0b101000,
        0b100101,
        0b100010,
        0b011101,
      ]
    },    
    '\'': {
      vOffset: -2,
      width: 1,
      data: [
        0b1,
        0b1,
      ],
      kerning: {
        's': -1
      }
    },
    '^': {
      vOffset: -1,
      width: 3,
      data: [
        0b010,
        0b101,
      ]
    },
    '`': {
      vOffset: -1,
      width: 2,
      data: [
        0b10,
        0b01,
      ]
    },
    ' ': {
      width: 3,
      data: [0]
    },
    '+': {
      vOffset: -1,
      width: 5,
      data: [
        0b00100,
        0b00100,
        0b11111,
        0b00100,
        0b00100
      ]
    },
    '*': {
      vOffset: -1,
      width: 5,
      data: [
        0b00100,
        0b10101,
        0b01110,
        0b10101,
        0b00100,
      ],
    },
    '/': {
      vOffset: -2,
      width:4,
      data: [
        0b0001,
        0b0001,
        0b0010,
        0b0010,
        0b0100,
        0b0100,
        0b1000,
        0b1000
      ]
    },
    '\\': {
      vOffset: -2,
      width: 4,
      data: [
        0b1000,
        0b1000,
        0b0100,
        0b0100,
        0b0010,
        0b0010,
        0b0001,
        0b0001
      ]
    },
    ',': {
      vOffset: 4,
      width: 2,
      data: [
        0b01,
        0b10
      ]
    },
    '-': {
      vOffset: 1,
      width: 4,
      data: [
        0b1111
      ]
    },
    '_': {
      vOffset: 5,
      width: 5,
      data: [
        0b11111
      ]
    },
    '.': {
      vOffset: 4,
      width: 1,
      data: [
        0b1
      ]
    },
    '[': {
      vOffset: -2,
      width: 2,
      data: [
        0b11,
        0b10,
        0b10,
        0b10,
        0b10,
        0b10,
        0b10,
        0b11
      ]
    },
    ']': {
      vOffset: -2,
      width: 2,
      data: [
        0b11,
        0b01,
        0b01,
        0b01,
        0b01,
        0b01,
        0b01,
        0b11
      ]
    },
    '(': {
      vOffset: -2,
      width: 2,
      data: [
        0b01,
        0b10,
        0b10,
        0b10,
        0b10,
        0b10,
        0b10,
        0b01
      ]
    },
    ')': {
      vOffset: -2,
      width: 2,
      data: [
        0b10,
        0b01,
        0b01,
        0b01,
        0b01,
        0b01,
        0b01,
        0b10
      ]
    },
    '{': {
      vOffset: -2,
      width: 3,
      data: [
        0b011,
        0b010,
        0b010,
        0b100,
        0b100,
        0b010,
        0b010,
        0b011
      ]
    },
    '|': {
      vOffset: -2,
      width: 1,
      data: [
        0b1,
        0b1,
        0b1,
        0b1,
        0b1,
        0b1,
        0b1,
        0b1
      ]
    },
    '}': {
      vOffset: -2,
      width: 3,
      data: [
        0b110,
        0b010,
        0b010,
        0b001,
        0b001,
        0b010,
        0b010,
        0b110
      ]
    },
    '0': {
      vOffset: -2,
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b1001,
        0b1001,
        0b1001,
        0b1001,
        0b0110
      ]
    },
    '1': {
      vOffset: -2,
      width: 2,
      data: [
        0b01,
        0b11,
        0b01,
        0b01,
        0b01,
        0b01,
        0b01
      ]
    },
    '2': {
      vOffset: -2,
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b0001,
        0b0010,
        0b0100,
        0b1000,
        0b1111
      ]
    },
    '3': {
      vOffset: -2,
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b0001,
        0b0110,
        0b0001,
        0b1001,
        0b0110
      ]
    },
    '4': {
      vOffset: -2,
      width: 4,
      data: [
        0b1001,
        0b1001,
        0b1001,
        0b1111,
        0b0001,
        0b0001,
        0b0001
      ]
    },
    '5': {
      vOffset: -2,
      width: 4,
      data: [
        0b1111,
        0b1000,
        0b1000,
        0b1110,
        0b0001,
        0b0001,
        0b1110
      ]
    },
    '6': {
      vOffset: -2,
      width: 4,
      data: [
        0b0111,
        0b1000,
        0b1000,
        0b1110,
        0b1001,
        0b1001,
        0b0110
      ]
    },
    '7': {
      vOffset: -2,
      width: 4,
      data: [
        0b1111,
        0b0001,
        0b0010,
        0b0100,
        0b0100,
        0b0100,
        0b0100
      ]
    },
    '8': {
      vOffset: -2,
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b1001,
        0b0110,
        0b1001,
        0b1001,
        0b0110
      ]
    },
    '9': {
      vOffset: -2,
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b1001,
        0b0111,
        0b0001,
        0b1001,
        0b0110
      ]
    },
    ':': {
      vOffset: 0,
      width: 1,
      data: [
        0b1,
        0b0,
        0b0,
        0b0,
        0b1
      ]
    },
    ';': {
      vOffset: -1,
      width: 2,
      data: [
        0b01,
        0b00,
        0b00,
        0b00,
        0b01,
        0b10
      ]
    },
    '<': {
      vOffset: -2,
      width: 4,
      data: [
        0b0001,
        0b0010,
        0b0100,
        0b1000,
        0b0100,
        0b0010,
        0b0001
      ]
    },
    '=': {
      width: 4,
      data: [
        0b1111,
        0b0000,
        0b1111
      ]
    },
    '>': {
      vOffset: -2,
      width: 4,
      data: [
        0b1000,
        0b0100,
        0b0010,
        0b0001,
        0b0010,
        0b0100,
        0b1000
      ]
    },
    '?': {
      vOffset: -2,
      width: 5,
      data: [
        0b01110,
        0b10001,
        0b00001,
        0b00010,
        0b00100,
        0b00000,
        0b00100
      ]
    },
    '@': {
      vOffset: -1,
      width: 5,
      data: [
        0b01110,
        0b10001,
        0b10101,
        0b10110,
        0b10000,
        0b01110
      ]
    },
    'A': {
      vOffset: -2,
      width: 5,
      data: [
        0b01110,
        0b10001,
        0b10001,
        0b11111,
        0b10001,
        0b10001,
        0b10001
      ]
    },
    'B': {
      vOffset: -2,
      width: 5,
      data: [
        0b11110,
        0b10001,
        0b10001,
        0b11110,
        0b10001,
        0b10001,
        0b11110
      ]
    },
    'C': {
      vOffset: -2,
      width: 5,
      data: [
        0b01110,
        0b10001,
        0b10000,
        0b10000,
        0b10000,
        0b10001,
        0b01110
      ]
    },
    'D': {
      vOffset: -2,
      width: 5,
      data: [
        0b11110,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b11110
      ]
    },
    'E': {
      vOffset: -2,
      width: 5,
      data: [
        0b11111,
        0b10000,
        0b10000,
        0b11100,
        0b10000,
        0b10000,
        0b11111
      ]
    },
    'F': {
      vOffset: -2,
      width: 5,
      data: [
        0b11111,
        0b10000,
        0b10000,
        0b11100,
        0b10000,
        0b10000,
        0b10000
      ]
    },
    'G': {
      vOffset: -2,
      width: 5,
      data: [
        0b01110,
        0b10001,
        0b10000,
        0b10111,
        0b10001,
        0b10001,
        0b01110
      ]
    },
    'H': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b10001,
        0b10001,
        0b11111,
        0b10001,
        0b10001,
        0b10001
      ]
    },
    'I': {
      vOffset: -2,
      width: 1,
      data: [
        0b1,
        0b1,
        0b1,
        0b1,
        0b1,
        0b1,
        0b1
      ]
    },
    'J': {
      vOffset: -2,
      width: 5,
      data: [
        0b00001,
        0b00001,
        0b00001,
        0b00001,
        0b00001,
        0b10001,
        0b01110
      ]
    },
    'K': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b10010,
        0b10100,
        0b11000,
        0b10100,
        0b10010,
        0b10001
      ]
    },
    'L': {
      vOffset: -2,
      width: 4,
      data: [
        0b1000,
        0b1000,
        0b1000,
        0b1000,
        0b1000,
        0b1000,
        0b1111
      ]
    },
    'M': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b11011,
        0b10101,
        0b10001,
        0b10001,
        0b10001,
        0b10001
      ]
    },
    'N': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b11001,
        0b10101,
        0b10011,
        0b10001,
        0b10001,
        0b10001
      ]
    },
    'O': {
      vOffset: -2,
      width: 5,
      data: [
        0b01110,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b01110
      ]
    },
    'P': {
      vOffset: -2,
      width: 5,
      data: [
        0b11110,
        0b10001,
        0b10001,
        0b11110,
        0b10000,
        0b10000,
        0b10000
      ]
    },
    'Q': {
      vOffset: -2,
      width: 5,
      data: [
        0b01110,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10010,
        0b01101
      ]
    },
    'R': {
      vOffset: -2,
      width: 5,
      data: [
        0b11110,
        0b10001,
        0b10001,
        0b11110,
        0b10001,
        0b10001,
        0b10001
      ]
    },
    'S': {
      vOffset: -2,
      width: 5,
      data: [
        0b01110,
        0b10001,
        0b10000,
        0b01110,
        0b00001,
        0b10001,
        0b01110
      ]
    },
    'T': {
      vOffset: -2,
      width: 5,
      data: [
        0b11111,
        0b00100,
        0b00100,
        0b00100,
        0b00100,
        0b00100,
        0b00100
      ],
      kerning: {
        'e': -1
      }
    },
    'U': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b01110
      ]
    },
    'V': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b01010,
        0b00100
      ]
    },
    'W': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10101,
        0b11011,
        0b10001
      ]
    },
    'X': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b10001,
        0b01010,
        0b00100,
        0b01010,
        0b10001,
        0b10001
      ]
    },
    'Y': {
      vOffset: -2,
      width: 5,
      data: [
        0b10001,
        0b10001,
        0b01010,
        0b00100,
        0b00100,
        0b00100,
        0b00100
      ]
    },
    'Z': {
      vOffset: -2,
      width: 5,
      data: [
        0b11111,
        0b00001,
        0b00010,
        0b00100,
        0b01000,
        0b10000,
        0b11111
      ]
    },
    'a': {
      width: 4,
      data: [
        0b0110,
        0b0001,
        0b0111,
        0b1001,
        0b0111
      ]
    },
    'b': {
      vOffset: -2,
      width: 4,
      data: [
        0b1000,
        0b1000,
        0b1110,
        0b1001,
        0b1001,
        0b1001,
        0b1110
      ]
    },
    'c': {
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b1000,
        0b1001,
        0b0110
      ]
    },
    'd': {
      vOffset: -2,
      width: 4,
      data: [
        0b0001,
        0b0001,
        0b0111,
        0b1001,
        0b1001,
        0b1001,
        0b0111
      ]
    },
    'e': {
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b1111,
        0b1000,
        0b0111
      ]
    },
    'f': {
      vOffset: -2,
      width: 3,
      data: [
        0b011,
        0b100,
        0b110,
        0b100,
        0b100,
        0b100,
        0b100
      ],
      kerning: {
        'e': -1,
        'o': -1,
        'r': -1,
      }
    },
    'g': {
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b1001,
        0b1001,
        0b0111,
        0b0001,
        0b0001,
        0b0110
      ]
    },
    'h': {
      width: 4,
      vOffset: -2,
      data: [
        0b1000,
        0b1000,
        0b1110,
        0b1001,
        0b1001,
        0b1001,
        0b1001
      ]
    },
    'i': {
      width: 1,
      vOffset: -2,
      data: [
        0b1,
        0b0,
        0b1,
        0b1,
        0b1,
        0b1,
        0b1
      ]
    },
    'j': {
      width: 3,
      vOffset: -2,
      data: [
        0b001,
        0b000,
        0b001,
        0b001,
        0b001,
        0b001,
        0b001,
        0b001,
        0b001,
        0b110
      ]
    },
    'k': {
      vOffset: -2,
      width: 4,
      data: [
        0b1000,
        0b1000,
        0b1001,
        0b1010,
        0b1100,
        0b1010,
        0b1001
      ]
    },
    'l': {
      vOffset: -2,
      width: 1,
      data: [
        0b1,
        0b1,
        0b1,
        0b1,
        0b1,
        0b1,
        0b1
      ]
    },
    'm': {
      width: 7,
      data: [
        0b0110110,
        0b1001001,
        0b1001001,
        0b1001001,
        0b1001001
      ]
    },
    'n': {
      width: 4,
      data: [
        0b1110,
        0b1001,
        0b1001,
        0b1001,
        0b1001
      ]
    },
    'o': {
      width: 4,
      data: [
        0b0110,
        0b1001,
        0b1001,
        0b1001,
        0b0110
      ]
    },
    'p': {
      width: 4,
      data: [
        0b1110,
        0b1001,
        0b1001,
        0b1001,
        0b1110,
        0b1000,
        0b1000,
        0b1000
      ]
    },
    'q': {
      width: 4,
      data: [
        0b0111,
        0b1001,
        0b1001,
        0b1001,
        0b0111,
        0b0001,
        0b0001,
        0b0001
      ]
    },
    'r': {
      width: 3,
      data: [
        0b101,
        0b110,
        0b100,
        0b100,
        0b100
      ],
      kerning: {
        'a': -1,
        ',': -1
      }
    },
    's': {
      width: 4,
      data: [
        0b0111,
        0b1000,
        0b0110,
        0b0001,
        0b1110
      ]
    },
    't': {
      vOffset: -2,
      width: 3,
      data: [
        0b100,
        0b100,
        0b111,
        0b100,
        0b100,
        0b100,
        0b011
      ],
      kerning: {
        'a': -1
      }
    },
    'u': {
      width: 4,
      data: [
        0b1001,
        0b1001,
        0b1001,
        0b1001,
        0b0111
      ]
    },
    'v': {
      width: 5,
      data: [
        0b10001,
        0b10001,
        0b10001,
        0b01010,
        0b00100
      ]
    },
    'w': {
      width: 7,
      data: [
        0b1001001,
        0b1001001,
        0b1001001,
        0b1001001,
        0b0110110
      ]
    },
    'x': {
      width: 5,
      data: [
        0b10001,
        0b01010,
        0b00100,
        0b01010,
        0b10001
      ]
    },
    'y': {
      width: 4,
      data: [
        0b1001,
        0b1001,
        0b1001,
        0b1001,
        0b0111,
        0b0001,
        0b0001,
        0b0110
      ]
    },
    'z': {
      width: 5,
      data: [
        0b11111,
        0b00010,
        0b00100,
        0b01000,
        0b11111
      ]
    },
    '~': {
      vOffset: 1,
      width: 5,
      data: [
        0b01101,
        0b10110,
      ]
    },
    '©': {
      vOffset: -2,
      width: 6,
      data: [
        0b011110,
        0b100001,
        0b101101,
        0b101001,
        0b101101,
        0b100001,
        0b011110
      ]
    }
  }
});
