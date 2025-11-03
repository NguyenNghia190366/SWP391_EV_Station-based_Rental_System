/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        sdz: {
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'slideDown': 'slideDown 0.3s ease',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        slideDown: {
          'from': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
