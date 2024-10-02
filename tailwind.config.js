/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./src/**/*.{html,ts}",],
  theme: {
    extend: {
      colors: {
        text: '#c9e8f5',
        bg: '#021a21',
        secondary: '#083a49',
        primary: '#042630',
        tertiary: '#4fa4c6',
        iconUnfocused: '#878787',
        iconFocused: '#c9e8f5',
        button: '#377e98',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        courierPrime: ['Courier Prime', 'monospace'],
      },
      backgroundImage: {
        'navbar-gradient': 'linear-gradient(180deg, #042630 36%, #083a49 100%)',
        'main-gradient': 'linear-gradient(180deg, #2e6170 0%, rgba(30, 68, 78, 0.61) 100%)',
        'bubble-gradient': 'linear-gradient(180deg, #346b7a 0%, #388196 100%)',
      },
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        '.btn': {
          backgroundColor: theme('colors.button'),
          fontFamily: theme('fontFamily.montserrat'),
          fontWeight: '400',
          fontSize: '16px',
          borderRadius: '8px',
          padding: '16px 12px',
          margin: '0 12px'
        },
        'h2': {
          fontFamily: theme('fontFamily.courierPrime'),
          fontSize: '22px',
          fontWeight: '400'
        }
      })
    },
  ],
}

