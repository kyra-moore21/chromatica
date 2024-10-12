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
        'bubble-gradient-selected': 'linear-gradient(145deg, #20414b, #38829665)',
      },
      boxShadow: {
        'neumorphic': '4px 4px 8px rgba(0, 0, 0, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.05)',
        'neumorphic-hover': '6px 6px 12px rgba(0, 0, 0, 0.3), -6px -6px 12px rgba(255, 255, 255, 0.05)',
        'neumorphic-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        '.emotion-container': {
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          maxWidth: '640px',
          margin: '0 auto',
          backgroundColor: 'rgba(2, 26, 33, 0.9)', // Slightly transparent bg color
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        '.moodBtn': {
          background: theme('backgroundImage.bubble-gradient'),
          fontSize: '14px',
          display: 'flex',
          borderRadius: '50%',
          padding: '0',
          display: 'flex',
          width: '95px',
          height: '95px',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          color: theme('colors.text'),
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
          boxShadow: theme('boxShadow.neumorphic'),
          fontFamily: theme('fontFamily.courierPrime'),
          '&.selected': {
            background: theme('backgroundImage.bubble-gradient-selected'),
            transform: 'scale(1.1)',
            boxShadow: theme('boxShadow.neumorphic-inset'),
          }
        },
        '.btn': {
          backgroundColor: theme('colors.tertiary'),
          fontFamily: theme('fontFamily.courierPrime'),
          fontWeight: '400',
          fontSize: '16px',
          borderRadius: '8px',
          padding: '16px 20px',
          margin: '0 12px'
        },
        'h2': {
          fontFamily: theme('fontFamily.courierPrime'),
          fontSize: '22px',
          fontWeight: '400'
        },
      })
    },
  ],
}

