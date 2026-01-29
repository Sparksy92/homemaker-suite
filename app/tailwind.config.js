/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e3ebe3',
          200: '#c5d6c5',
          300: '#9db99d',
          400: '#759975',
          500: '#557d55', // Primary Green
          600: '#426142',
          700: '#364d36', // Deep Forest
          800: '#2d3d2d',
          900: '#263226',
        },
        sand: {
          50: '#fdfcf8',
          100: '#fbf9f1',
          200: '#f4f1de', // Warm Sand (Background)
          300: '#e9e3c1',
          400: '#dacd9c',
          500: '#c7b07b',
          600: '#aa8f5d',
          700: '#897048',
          800: '#715b3e',
          900: '#5e4b36',
        },
        terracotta: {
          50: '#fdf6f4',
          100: '#faede9',
          200: '#f5dcd5',
          300: '#eebfb4',
          400: '#e69a8a',
          500: '#e07a5f', // Accent
          600: '#cc5a3d',
          700: '#aa442b',
          800: '#8d3926',
          900: '#753224',
        },
        charcoal: {
          DEFAULT: '#3d405b',
          light: '#5d607b',
          dark: '#26283a',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
