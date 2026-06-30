import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0922AC',
          900: '#061875',
          700: '#0922AC',
          500: '#2545C7',
          300: '#5B7BE5',
          100: '#C5D1F5',
          foreground: '#FFFFFF',
        },
        'sky-blue': {
          DEFAULT: '#29A9F5',
          foreground: '#FFFFFF',
        },
        pink: {
          DEFAULT: '#FF4B8B',
        },
        teal: {
          DEFAULT: '#00C0A0',
        },
        surface: {
          DEFAULT: '#E8EDFB',
          light: '#F0F3FD',
          bg: '#F6F6F9',
          subtle: '#FAFBFF',
          neutral: '#F8FAFC',
        },
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#F59E0B',
        heart: '#EF4444',
        up: '#E53935',
        down: '#1565C0',
        border: '#E5E7EB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          sub: '#6B7280',
          tertiary: '#9CA3AF',
        },
      },
      maxWidth: {
        mobile: '500px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        blink: 'blink 1.2s ease-in-out infinite',
        'char-in': 'char-in 0.15s ease-out',
        'char-out': 'char-out 0.12s ease-in forwards',
        'value-in': 'value-in 0.2s ease-out',
        'splash-in': 'splash-in 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'splash-float': 'splash-float 3.2s ease-in-out infinite',
        'splash-text': 'splash-text 0.5s ease-out 0.5s both',
        'dot-bounce': 'dot-bounce 1.4s ease-in-out infinite',
        shimmer: 'shimmer 0.75s ease-in-out 0.8s 1 normal both',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'char-in': {
          '0%': { transform: 'translateY(-60%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'char-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60%)', opacity: '0' },
        },
        'value-in': {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'splash-in': {
          '0%': { opacity: '0', transform: 'scale(0.4)' },
          '70%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'splash-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'splash-text': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dot-bounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.35' },
          '30%': { transform: 'translateY(-9px)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%)' },
          '100%': { transform: 'translateX(250%)' },
        },
      },
    },
  },
  plugins: [animate],
}

export default config
