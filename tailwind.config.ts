import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: false,
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1C1FE8',
          light: '#4A90FF',
          foreground: '#FFFFFF',
        },
        orange: {
          DEFAULT: '#FF6830',
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
        up: '#E53935',     // 주가 상승 (빨강)
        down: '#1565C0',   // 주가 하락 (파랑)
        surface: '#F5F6F8',
        border: '#EEEEEE',
        text: {
          primary: '#111111',
          secondary: '#666666',
          tertiary: '#999999',
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
    },
  },
  plugins: [animate],
}

export default config
