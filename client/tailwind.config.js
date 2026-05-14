/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  '#f0f7f4',
          100: '#dceee5',
          200: '#b8ddcb',
          300: '#8dc5aa',
          400: '#5fa886',
          500: '#40916c',
          600: '#2d6a4f',
          700: '#1b4332',
          800: '#143728',
          900: '#0d2b1e',
        },
        cream: {
          50:  '#fefdfb',
          100: '#faf8f5',
          200: '#f5f0e8',
          300: '#ede5d8',
          400: '#ddd0bc',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-down': 'slide-down 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
