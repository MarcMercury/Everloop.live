import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Everloop Brand Colors
        charcoal: {
          DEFAULT: '#0f1419',
          50: '#f5f6f7',
          100: '#e4e6e8',
          200: '#c8ccd1',
          300: '#a3a9b1',
          400: '#757e89',
          500: '#5a636e',
          600: '#4a515a',
          700: '#3f444b',
          800: '#383c42',
          900: '#0f1419',
          950: '#0a0d10',
        },
        navy: {
          DEFAULT: '#161d26',
          50: '#f4f6f8',
          100: '#e3e8ed',
          200: '#c7d0db',
          300: '#a2b0c1',
          400: '#7589a0',
          500: '#5a6d85',
          600: '#4d5c70',
          700: '#434e5d',
          800: '#3b4450',
          900: '#161d26',
          950: '#0e1218',
        },
        gold: {
          DEFAULT: '#c9a227',
          50: '#fbf9eb',
          100: '#f6f0cc',
          200: '#efe09c',
          300: '#e5c963',
          400: '#dbb33a',
          500: '#c9a227',
          600: '#a97f1e',
          700: '#885d1b',
          800: '#714b1d',
          900: '#613f1e',
          950: '#38210d',
        },
        // Shadcn semantic colors (dark mode focused)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        canon: {
          DEFAULT: '#c9a227',
          glow: 'rgba(201, 162, 39, 0.4)',
        },
      },
      fontFamily: {
        serif: ['var(--font-crimson)', 'Crimson Text', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Atmospheric text sizes
        'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'subtitle': ['1.5rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(201, 162, 39, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(201, 162, 39, 0.6)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(to bottom, #0f1419, #161d26)',
        'gradient-canon': 'linear-gradient(135deg, #c9a227 0%, #dbb33a 50%, #c9a227 100%)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-links': '#c9a227',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-quotes': 'hsl(var(--muted-foreground))',
            '--tw-prose-quote-borders': '#c9a227',
            maxWidth: 'none',
          },
        },
        invert: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
          },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}

export default config
