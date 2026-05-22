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
          DEFAULT: '#C9A84C',
          light: '#E8C97D',
          dark: '#A88A3A',
          muted: '#7A6230',
        },
        surface: {
          DEFAULT: '#111111',
          elevated: '#161616',
          overlay: '#1E1E1E',
        },
        bsm: {
          border: '#222222',
          'border-light': '#2A2A2A',
          'text-primary': '#F0F0EC',
          'text-secondary': '#9A9A9A',
          'text-muted': '#666666',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #E8C97D 50%, #A88A3A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        gold: '0 0 24px rgba(201, 168, 76, 0.12)',
        'gold-sm': '0 0 10px rgba(201, 168, 76, 0.08)',
        card: '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 48px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}

export default config
