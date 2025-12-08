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
        // Everloop Brand Colors - Fantasy Teal + Parchment
        charcoal: {
          DEFAULT: '#0d1a1a',
          50: '#f0f5f5',
          100: '#d9e6e6',
          200: '#b3cccc',
          300: '#80a6a6',
          400: '#4d8080',
          500: '#336666',
          600: '#264d4d',
          700: '#1a3333',
          800: '#142828',
          900: '#0d1a1a',
          950: '#080f0f',
        },
        navy: {
          DEFAULT: '#142828',
          50: '#f0f7f7',
          100: '#d9ebeb',
          200: '#b3d6d6',
          300: '#80b8b8',
          400: '#4d9999',
          500: '#337a7a',
          600: '#266060',
          700: '#1a4545',
          800: '#142828',
          900: '#0d1f1f',
          950: '#081414',
        },
        gold: {
          DEFAULT: '#d4a84b',
          50: '#fdfaf0',
          100: '#faf3dc',
          200: '#f5e6b8',
          300: '#efd48a',
          400: '#e5be5c',
          500: '#d4a84b',
          600: '#b88c3a',
          700: '#966f2e',
          800: '#785828',
          900: '#634824',
          950: '#3a2812',
        },
        // Parchment tones for text
        parchment: {
          DEFAULT: '#e8dcc4',
          light: '#f6f0e0',
          dark: '#d4c4a8',
          muted: '#a89888',
        },
        // Deep teal for backgrounds
        teal: {
          deep: '#0d1f1f',
          rich: '#142828',
          mid: '#1a3333',
          light: '#2a4545',
        },
        // Shadcn semantic colors
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
          DEFAULT: '#d4a84b',
          glow: 'rgba(212, 168, 75, 0.4)',
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
