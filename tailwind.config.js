
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Colores principales de Eventu Colombia
        primary: {
          50: '#fce7f3',
          100: '#fbcfe8',
          200: '#f9a8d4',
          300: '#f472b6',
          400: '#f06292',
          500: '#E4006F', // magenta principal
          600: '#d81b60',
          700: '#c2185b',
          800: '#ad1457',
          900: '#880e4f',
        },
        // Colores secundarios
        secondary: {
          50: '#fff0f6',
          100: '#ffe0ed',
          200: '#ffc7db',
          300: '#ff9fc4',
          400: '#FF1E80', // hotPink
          500: '#FF4EB6', // fuchsia
          600: '#e91e63',
          700: '#c2185b',
          800: '#9c1453',
          900: '#7b1248',
        },
        // Colores de acento
        accent: {
          50: '#f5f0ff',
          100: '#ebe0ff',
          200: '#d6c1ff',
          300: '#b894ff',
          400: '#9b5eff',
          500: '#A42EFF', // violet
          600: '#8b1ed9',
          700: '#6f17b3',
          800: '#5a1390',
          900: '#4a1076',
        },
        // Colores neutros
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#666666',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#1A1A1A',
        },
        // Colores de estado
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          500: '#00C853',
          600: '#00b248',
          700: '#00993d',
        },
        error: {
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#FF1744',
          600: '#e0143c',
          700: '#c01234',
        },
        warning: {
          50: '#fff8e1',
          100: '#ffecb3',
          500: '#FFB300',
          600: '#e6a100',
          700: '#cc8f00',
        },
      },
      // Tipografía moderna
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          "'Roboto'",
          "'Inter'",
          "'Helvetica Neue'",
          'Arial',
          'sans-serif',
        ],
        serif: ['Georgia', "'Times New Roman'", 'serif'],
        mono: [
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          "'Liberation Mono'",
          "'Courier New'",
          'monospace',
        ],
      },
      // Espaciado
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Bordes redondeados
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      // Sombras modernas
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(228, 0, 111, 0.3)',
        'glow-lg': '0 0 30px rgba(228, 0, 111, 0.4)',
      },
    },
  },
  plugins: [],
}
