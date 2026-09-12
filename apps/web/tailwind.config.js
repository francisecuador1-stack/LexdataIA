/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#1a2332',
          950: '#0f1e3d',
        },
        brand: {
          bg: '#f5f7fa',
        },
      },
    },
  },
  plugins: [],
};
