/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Trading Ticket Book palette
        coupon: {
          ground: '#F5F0E8',
          ink: '#4A3A5A',
          header: '#0B1D3A',
          void: '#C0392B',
          verified: '#27AE60',
          amber: '#E6B800',
          carbon: '#2D2D2D',
        },
        // Terminal green accent
        terminal: {
          green: '#7EE787',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        'base-mono': ['13px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'sm-mono': ['11px', { lineHeight: '1.5', letterSpacing: '0.03em' }],
        'xs-mono': ['10px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        'lg-mono': ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
      },
      borderWidth: {
        'hairline': '0.5px',
      },
      borderColor: {
        'carbon-rule': '#D4C8B8',
        'carbon-deep': '#C4B8A8',
      },
    },
  },
  plugins: [],
}