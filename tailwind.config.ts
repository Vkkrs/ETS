import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'ets-bg':           '#080808',
        'ets-surface':      '#0F0F0F',
        'ets-border-deep':  '#0C0C0C',
        'ets-border-mid':   '#0D0D0D',
        'ets-border':       '#111111',
        'ets-text-primary': '#FAFAF8',
        'ets-text-active':  '#D8D4C8',
        'ets-text-mid':     '#C8C8C4',
        'ets-text-muted':   '#B8B4A8',
        'ets-text-low':     '#606060',
        'ets-text-ghost':   '#282828',
        'ets-accent':       '#00FF88',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body:    ['var(--font-inter)', 'sans-serif'],
      },
      maxWidth: {
        'app': '390px',
      },
    },
  },
  plugins: [],
};
export default config;
