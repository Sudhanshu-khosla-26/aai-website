/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // AAI Brand Colors
        aai: {
          primary: '#003366',      // Deep Navy Blue
          secondary: '#FF9933',    // Saffron Orange
          green: '#138808',        // Indian Green
          light: '#F8F9FA',        // Off-white background
          white: '#FFFFFF',
        },
        primary: {
          50: '#E6EEF5',
          100: '#CCDEE9',
          200: '#99BDD3',
          300: '#669CBD',
          400: '#337BA7',
          500: '#005A91',
          600: '#004A7A',
          700: '#003A63',
          800: '#002A4C',
          900: '#001A35',
        },
        secondary: {
          50: '#FFF4E6',
          100: '#FFE3C2',
          200: '#FFC78A',
          300: '#FFA64D',
          400: '#FF8B1F',
          500: '#FF9933',
          600: '#E6801F',
          700: '#CC6A0F',
          800: '#B35607',
          900: '#8A3F00',
        },
        // Status Colors
        status: {
          success: '#10B981',      // Green for present/approved
          error: '#EF4444',        // Red for absent/rejected
          warning: '#F59E0B',      // Amber for pending
          info: '#3B82F6',         // Blue for leave
        },
        // Grey Scale
        grey: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
