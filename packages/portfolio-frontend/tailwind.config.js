/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 暗色系主题
        background: '#0D1117',
        surface: '#161B22',
        surfaceHover: '#21262D',
        border: '#30363D',
        textPrimary: '#F0F6FC',
        textSecondary: '#8B949E',
        accent: '#58A6FF',
        accentHover: '#79C0FF',
        success: '#3FB950',
        warning: '#D29922',
        error: '#F85149'
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      maxWidth: {
        container: '1200px'
      }
    }
  },
  plugins: []
};
