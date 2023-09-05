const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: ['grid-cols-[repeat(9,1fr)]', 'grid-cols-[repeat(16,1fr)]', 'grid-cols-[repeat(32,1fr)]', 'text-[hsl(40,50%,50%)]', 'text-[hsl(80,50%,50%)]', 'text-[hsl(120,50%,50%)]', 'text-[hsl(160,50%,50%)]', 'text-[hsl(200,50%,50%)]', 'text-[hsl(240,50%,50%)]', 'text-[hsl(280,50%,50%)]', 'text-[hsl(320,50%,50%)]'],
  theme: {
    screens: {
      xs: '375px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      animation: {
        bounce: 'bounce 1s var(--i) infinite',
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(-20%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
