import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F8FA',
        panel: '#FFFFFF',
        raised: '#F1F3F6',
        line: '#E2E5EA',
        ink: '#15171C',
        muted: '#64748B',
        amber: '#D9550A',
        teal: '#0D8577',
      },
      fontFamily: {
        grotesk: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jbmono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        card: '14px',
      },
      boxShadow: {
        amber: '0 0 24px rgba(217,85,10,0.18)',
        teal: '0 0 24px rgba(13,133,119,0.16)',
        card: '0 1px 2px rgba(16,24,40,0.06)',
        'card-hover': '0 12px 28px -8px rgba(16,24,40,0.16)',
      },
    },
  },
  plugins: [],
}
export default config
