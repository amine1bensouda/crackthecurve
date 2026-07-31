/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f2e7',
          100: '#eae2d2',
          200: '#d4cbb8',
          300: '#a8b0bc',
          400: '#6b7180',
          500: '#3f7267',
          600: '#2c3c5e',
          700: '#1d2a45',
          800: '#162038',
          900: '#0f1729',
        },
        brand: {
          navy: '#2c3c5e',
          'navy-dark': '#1d2a45',
          emerald: '#3f7267',
          plum: '#95586b',
          amber: '#c79a55',
          bg: '#fdfbf7',
          soft: '#f8f2e7',
          muted: '#6b7180',
          line: '#eae2d2',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        gold: {
          50: '#fffef5',
          100: '#fffce8',
          200: '#fff8c4',
          300: '#fff28e',
          400: '#ffe557',
          500: '#ffd700',
          600: '#e6c200',
          700: '#b89600',
          800: '#8b6f00',
          900: '#5c4800',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-lg': '0 0 30px rgba(14, 165, 233, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

