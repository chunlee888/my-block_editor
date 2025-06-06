// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Configure files to scan for Tailwind classes
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // If you have public HTML files using Tailwind, you might include:
    // "./public/index.html",
  ],
  theme: {
    extend: {
      // Custom font family definition
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
