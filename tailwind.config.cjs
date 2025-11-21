/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./agents/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: 'rgb(var(--color-background))',
        surface: 'rgb(var(--color-surface))',
        border: 'rgb(var(--color-border))',
        
        primary: {
          DEFAULT: 'rgb(var(--color-primary))',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary))',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted))',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent-main))', // Red
          hover: 'rgb(var(--color-accent-dark))',
          light: 'rgb(var(--color-accent-light))',
          orange: 'rgb(var(--color-accent-second))',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, rgb(var(--color-accent-main)), rgb(var(--color-accent-second)))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
