/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Spline Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        ll: {
          canvas: '#d4e4ee',
          surface: '#ffffff',
          border: 'rgba(15, 23, 42, 0.08)',
          accent: '#0d9488',
          periwinkle: '#8b9dc9',
          mint: '#7dd3c0',
          peach: '#f4c4a8',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        ll: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
        'll-lg': '0 4px 6px rgba(15, 23, 42, 0.03), 0 20px 40px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
