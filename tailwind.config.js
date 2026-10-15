/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        prompt: ['Prompt', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        quest: {
          purple: '#7C3AED',
          indigo: '#4F46E5',
          blue: '#0EA5E9',
          gold: '#F59E0B',
          amber: '#D97706',
          green: '#10B981',
          red: '#EF4444',
          dark: '#0F0C29',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'confetti': 'confetti 1s ease-out forwards',
        'xp-toast': 'xp-toast 2.5s ease-out forwards',
        'combo-pulse': 'combo-pulse 0.3s ease-out',
        'star-spin': 'star-spin 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(124,58,237,0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(124,58,237,0.9), 0 0 50px rgba(124,58,237,0.4)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'xp-toast': {
          '0%': { transform: 'translateX(120px)', opacity: '0' },
          '15%': { transform: 'translateX(0)', opacity: '1' },
          '75%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(120px)', opacity: '0' },
        },
        'combo-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'star-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
    },
  },
  plugins: [],
}
