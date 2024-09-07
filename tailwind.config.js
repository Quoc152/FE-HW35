/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html', 
    './js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'checkbox-checked': '#e0f2f1', 
        'checkbox-border': '#004d40',  
      }
    }, 
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}

