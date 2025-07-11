import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                quiet: '#CFFAFE', // м'який блакитний
                medium: '#FEF3C7', // теплий жовтий
                loud: '#FCA5A5',   // м'який червоний
                forest: '#DCFCE7', // зелений фон
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            boxShadow: {
                soft: '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                pulseQuiet: 'pulse 2.5s infinite',
            },
        },
    },
    darkMode: 'class', // Якщо хочеш підтримку темної теми
    plugins: [],
}
export default config;
