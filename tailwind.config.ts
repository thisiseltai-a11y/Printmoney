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
        bg: '#12151A',
        panel: '#1B1F26',
        raised: '#22262E',
        line: '#2C313A',
        ink: '#EDEFF2',
        muted: '#8B909A',
        amber: '#FF8A3D',
        teal: '#3ED9C0',
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
        amber: '0 0 24px rgba(255,138,61,0.25)',
        teal: '0 0 24px rgba(62,217,192,0.20)',
        card: '0 1px 2px rgba(0,0,0,0.4)',
        'card-hover': '0 12px 32px -8px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
export default config
