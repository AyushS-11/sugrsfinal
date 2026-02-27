/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: { sans: ['DM Sans', 'Segoe UI', 'sans-serif'] },
            colors: {
                brand: { DEFAULT: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
            }
        }
    },
    plugins: []
}
