import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0A0A0A',
          50: '#1A1A1A',
          100: '#141414',
          200: '#111111',
          300: '#0D0D0D',
        },
        gold: {
          DEFAULT: '#C6A64B',
          light: '#DEC070',
          dark: '#A88935',
          muted: '#5F4A18',
          soft: '#A88935',
        },
        silver: {
          DEFAULT: '#C9C9C9',
          muted: '#A8A8A8',
          dark: '#9E9E9E', // subido de #757575 para pasar contraste AA (4.5:1) sobre fondos oscuros
        },
        surface: {
          DEFAULT: '#111111',
          elevated: '#161616',
          overlay: '#1E1E1E',
        },
        bsm: {
          border: '#2A2A2A',
          'border-light': '#1E1E1E',
          'text-primary': '#F4F1EA',
          'text-secondary': '#9A9A9A',
          'text-muted': '#979797', // subido de #8A8A8A para pasar AA sobre superficies elevadas
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C6A64B 0%, #E8C97D 50%, #A88A3A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        gold: '0 0 24px rgba(198, 166, 75, 0.12)',
        'gold-sm': '0 0 10px rgba(198, 166, 75, 0.08)',
        card: '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 48px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}

export default config
