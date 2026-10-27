/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          cream: '#FBF8F2',
          ivory: '#F4ECE1',
          paper: '#FAF5EC',
          sand: '#ECE3D4',
          brown: '#281A14',
          'brown-dark': '#1C120D',
          'brown-light': '#3B2920',
          charcoal: '#171413',
          'charcoal-light': '#262220',
          olive: '#4D5D46',
          'olive-dark': '#384533',
          'olive-light': '#667A5D',
          burgundy: '#731C28',
          'burgundy-dark': '#54111B',
          'burgundy-light': '#932837',
          gold: '#C49C4C',
          'gold-dark': '#9E7A31',
          'gold-light': '#E0BD74',
          border: '#E4DACB',
          'border-dark': '#382821',
          muted: '#756A60',
          'muted-light': '#9E9285',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'vintage-sm': '0 2px 6px -1px rgba(40, 26, 20, 0.08), 0 1px 4px -1px rgba(40, 26, 20, 0.04)',
        'vintage': '0 8px 24px -4px rgba(40, 26, 20, 0.12), 0 2px 8px -2px rgba(40, 26, 20, 0.06)',
        'vintage-lg': '0 16px 36px -6px rgba(40, 26, 20, 0.16), 0 4px 12px -2px rgba(40, 26, 20, 0.08)',
        'vintage-gold': '0 8px 25px -4px rgba(196, 156, 76, 0.25)',
      },
      borderRadius: {
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
      }
    },
  },
  plugins: [],
}
