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
          secondary: '#374151',
          sub: '#6B7280',
          tertiary: '#9CA3AF',
        },
      },
      maxWidth: {
        mobile: '430px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        blink: 'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [animate],
}

export default config
