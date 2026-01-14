/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
    './index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0A0F3D',
        accent: '#af2025',
      },
    },
  },
  plugins: [],
}
