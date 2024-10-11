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
        spotify: '#1DB954',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        courierPrime: ['Courier Prime', 'monospace'],
      },
      backgroundImage: {
        'navbar-gradient': 'linear-gradient(180deg, #042630 36%, #083a49 100%)',
        'main-gradient': 'linear-gradient(0deg, #2e6170 0%, rgba(30, 68, 78, 0.39) 100%)',
        'bubble-gradient': 'linear-gradient(180deg, #346b7a 0%, #388196 100%)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        'my-theme': {
          primary: '#042630',
          'primary-focus': '#021a21',
          'primary-content': '#c9e8f5',
          secondary: '#083a49',
          'secondary-focus': '#042630',
          'secondary-content': '#c9e8f5',
          accent: '#4fa4c6',
          'accent-focus': '#4fa4c6',
          'accent-content': '#c9e8f5',
          neutral: '#2e6170',
          'neutral-focus': '#2e6170',
          'neutral-content': '#c9e8f5',
          'base-100': '#021a21',
          'base-200': '#083a49',
          'base-300': '#4fa4c6',
          'base-content': '#c9e8f5',
          info: '#1DB954',
          'info-content': 'white',
          success: '#D9534F',
          warning: '#FFEB99',
          'warning-content': 'black',
          error: '#D9534F',
        },
      }
    ]
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        // '.btn': {
        //   backgroundColor: theme('colors.button'),
        //   fontFamily: theme('fontFamily.montserrat'),
        //   fontWeight: '400',
        //   fontSize: '16px',
        //   borderRadius: '8px',
        //   padding: '16px 12px',
        //   margin: '0 12px'
        // },
        'h2': {
          fontFamily: theme('fontFamily.courierPrime'),
          fontSize: '22px',
          fontWeight: '400'
        }
      })
    },
    require('daisyui'),
  ],
}

