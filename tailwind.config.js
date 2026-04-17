/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Poppins', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        purple: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#060b1a',
          950: '#03060f',
        },
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out forwards',
        'fade-in-up':  'fadeInUp 0.6s ease-out forwards',
        'fade-in-down':'fadeInDown 0.6s ease-out forwards',
        'float':       'float 4s ease-in-out infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':     'shimmer 1.6s linear infinite',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
        'gradient':    'gradientShift 5s ease infinite',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'orb-float':   'orbFloat 8s ease-in-out infinite',
        'spin-slow':   'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37,99,235,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(124,58,237,0.5)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%':      { transform: 'translate(20px, -20px)' },
          '66%':      { transform: 'translate(-10px, 15px)' },
        },
      },
      boxShadow: {
        'glass':      '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-sm':   '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-blue':  '0 0 30px rgba(37,99,235,0.4)',
        'glow-purple':'0 0 30px rgba(124,58,237,0.4)',
        'glow-gold':  '0 0 24px rgba(245,158,11,0.35)',
        'card':       '0 20px 60px rgba(0,0,0,0.5)',
        'card-hover': '0 30px 80px rgba(0,0,0,0.6)',
        'btn':        '0 8px 24px rgba(37,99,235,0.35)',
        'btn-hover':  '0 14px 36px rgba(37,99,235,0.5)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient':   'linear-gradient(135deg, #03060f 0%, #060b1a 50%, #0a0f24 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        'btn-gradient':    'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        'gold-gradient':   'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'text-gradient':   'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #e879f9 100%)',
      },
    },
  },
  plugins: [],
}
