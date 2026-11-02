/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Driven by CSS variables so the Web Lumina chapter can invert the palette.
        ink: { DEFAULT: 'rgb(var(--ink) / <alpha-value>)', 2: 'rgb(var(--ink-2) / <alpha-value>)' },
        bone: {
          DEFAULT: 'rgb(var(--bone) / <alpha-value>)',
          dim: 'rgb(var(--bone-dim) / <alpha-value>)',
          faint: 'rgb(var(--bone-faint) / <alpha-value>)',
        },
        // Sampled from the portrait: the rose shirt and the glacier-fed river.
        accent: { DEFAULT: '#ff4f8b', soft: '#ff8fb4' },
        glacier: '#8fd6c8',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { tightest: '-0.055em' },
    },
  },
  plugins: [],
};
