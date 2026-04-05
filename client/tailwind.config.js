/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6", // Purple
        secondary: "#10B981", // Green
        dark: "#0F172A", // Slate-900
        vibrant: "#F43F5E", // Rose
      }
    },
  },
  plugins: [],
}
