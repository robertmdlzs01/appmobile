
module.exports = {
  content: [
    './app*.{js,jsx,ts,tsx}',
    './components*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        
        primary: {
          50: '#fce7f3',
          100: '#fbcfe8',
          200: '#f9a8d4',
          300: '#f472b6',
          400: '#f06292',
          500: '#e91e63', 
          600: '#d81b60',
          700: '#c2185b',
          800: '#ad1457',
          900: '#880e4f',
        },
      },
    },
  },
  plugins: [],
}
