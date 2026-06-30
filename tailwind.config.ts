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
        neon:    '#7CFC00',
        dark:    '#0a0a0a',
        card:    '#111111',
        elevated:'#171717',
        dim:     '#222222',
        muted:   '#555555',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(124,252,0,0.25)',
        'neon-sm': '0 0 10px rgba(124,252,0,0.15)',
      },
    },
  },
  plugins: [],
}
export default config
