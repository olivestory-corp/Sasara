import plugin from 'tailwindcss/plugin'

const round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '')
// const rem = (px) => `${round(px / 16)}rem`
const em = (px, base) => `${round(px / base)}em`

/** @type {import('tailwindcss').Config} */
export default {
  // darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        'background-main': 'hsl(var(--background-main))',
        'headline-main': 'hsl(var(--headline-main))',
        'headline-sidebar': 'hsl(var(--headline-sidebar))',
        'headline-sidebar-selected': 'hsl(var(--headline-sidebar-selected))',
        'titlebar-background': 'hsl(var(--titlebar-background))',
        'titlebar-foreground': 'hsl(var(--titlebar-foreground))',
        'titlebar-background-selected': 'hsl(var(--titlebar-background-selected))',
        'titlebar-foreground-selected': 'hsl(var(--titlebar-foreground-selected))',
        'sidebar-background': 'hsl(var(--sidebar-background))',
        'sidebar-foreground': 'hsl(var(--sidebar-foreground))',
        'sidebar-background-selected': 'hsl(var(--sidebar-background-selected))',
        'sidebar-foreground-selected': 'hsl(var(--sidebar-foreground-selected))',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            p: {
              marginTop: em(8, 16),
              marginBottom: em(8, 16),
            },
            ol: {
              marginTop: em(8, 16),
              marginBottom: em(8, 16),
            },
            ul: {
              marginTop: em(8, 16),
              marginBottom: em(8, 16),
            },
            li: {
              marginTop: em(3.2, 16),
              marginBottom: em(3.2, 16),
            },
            '> ul > li p': {
              marginTop: em(4.8, 16),
              marginBottom: em(4.8, 16),
            },
            '> ul > li > p:first-child': {
              marginTop: em(8, 16),
            },
            '> ul > li > p:last-child': {
              marginBottom: em(8, 16),
            },
            '> ol > li > p:first-child': {
              marginTop: em(8, 16),
            },
            '> ol > li > p:last-child': {
              marginBottom: em(8, 16),
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: em(4.8, 16),
              marginBottom: em(4.8, 16),
            },
            dl: {
              marginTop: em(8, 16),
              marginBottom: em(8, 16),
            },
            dt: {
              marginTop: em(8, 16),
            },
            dd: {
              marginTop: em(3.2, 16),
            },
            'blockquote p:first-of-type::before': {
              content: '',
            },
            'blockquote p:last-of-type::after': {
              content: '',
            },
          },
        },
      }),
      animation: {
        rotate: 'rotate 10s linear infinite',
      },
      keyframes: {
        rotate: {
          '0%': { transform: 'rotate(0deg) scale(10)' },
          '100%': { transform: 'rotate(-360deg) scale(10)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    plugin(function ({ addBase, theme }) {
      addBase({
        ':root': {
          '--tw-color-slate-50': hexToHSL(theme('colors.slate.50')),
          '--tw-color-slate-100': hexToHSL(theme('colors.slate.100')),
          '--tw-color-slate-200': hexToHSL(theme('colors.slate.200')),
          '--tw-color-slate-300': hexToHSL(theme('colors.slate.300')),
          '--tw-color-slate-400': hexToHSL(theme('colors.slate.400')),
          '--tw-color-slate-500': hexToHSL(theme('colors.slate.500')),
          '--tw-color-slate-600': hexToHSL(theme('colors.slate.600')),
          '--tw-color-slate-700': hexToHSL(theme('colors.slate.700')),
          '--tw-color-slate-800': hexToHSL(theme('colors.slate.800')),
          '--tw-color-slate-900': hexToHSL(theme('colors.slate.900')),
        },
      })
    }),
  ],
}
function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0
  if (H.length == 4) {
    r = '0x' + H[1] + H[1]
    g = '0x' + H[2] + H[2]
    b = '0x' + H[3] + H[3]
  } else if (H.length == 7) {
    r = '0x' + H[1] + H[2]
    g = '0x' + H[3] + H[4]
    b = '0x' + H[5] + H[6]
  }
  // Then to HSL
  r /= 255
  g /= 255
  b /= 255
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0

  if (delta == 0) h = 0
  else if (cmax == r) h = ((g - b) / delta) % 6
  else if (cmax == g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4

  h = Math.round(h * 60)

  if (h < 0) h += 360

  l = (cmax + cmin) / 2
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  s = +(s * 100).toFixed(1)
  l = +(l * 100).toFixed(1)

  return `${h} ${s}% ${l}%`
}
