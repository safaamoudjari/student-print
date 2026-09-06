/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F5',
        blush: {
          50: '#FFF3F7',
          100: '#FFE3EE',
          200: '#FFD0E2',
          300: '#FFB3D0',
        },
        rose: {
          400: '#FF7BAA',
          500: '#F0518C',
          600: '#D93D76',
          700: '#B62E60',
        },
        lavender: {
          100: '#EFE9FB',
          200: '#DCD0F5',
          300: '#C3AEEE',
          400: '#A98CE0',
          500: '#8E6ED0',
        },
        ink: {
          400: '#8B7691',
          500: '#6B5771',
          600: '#4E3E56',
          700: '#3A2942',
        },
        mint: {
          100: '#DFF7EC',
          400: '#4FCB98',
          500: '#33B382',
        },
        amber: {
          100: '#FFF1D8',
          400: '#FFB648',
          500: '#F59E1E',
        },
        coral: {
          100: '#FFE2DE',
          400: '#FF8A75',
          500: '#F16549',
        },
      },
      fontFamily: {
        display: ['"Fredoka"', 'ui-rounded', 'sans-serif'],
        body: ['"Nunito"', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        blush: '0 12px 30px -8px rgba(240, 81, 140, 0.28)',
        soft: '0 8px 24px -10px rgba(107, 87, 113, 0.18)',
        lift: '0 18px 40px -12px rgba(217, 61, 118, 0.35)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-2deg)' },
        },
        popin: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        popin: 'popin 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
