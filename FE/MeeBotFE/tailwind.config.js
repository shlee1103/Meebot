/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          md: "3rem",
          lg: "6rem",
          xl: "150px",
          "2xl": "150px",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
      },
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
        stunning: ["STUNNING", "sans-serif"],
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-5px)" },
          "40%": { transform: "translateX(5px)" },
          "60%": { transform: "translateX(-5px)" },
          "80%": { transform: "translateX(5px)" },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(107,76,255,0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(107,76,255,0.8)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        gradient: 'gradient 8s linear infinite',
        glow: 'glow 2s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        shake: "shake 0.3s ease-in-out",
        'slide-out-left': 'slideOutLeft 0.5s ease-in-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-in-out forwards'
      },
      fontSize: {
        // Desktop (lg)
        'h1-lg': ['3.75rem', { // 60px
          lineHeight: '98%',
          letterSpacing: '-0.02em',
          fontWeight: '700',
        }],
        'h2-lg': ['3rem', { // 48px
          lineHeight: '98%',
          letterSpacing: '-0.02em',
          fontWeight: '600',
        }],
        'h3-lg': ['2.25rem', { // 36px
          lineHeight: '120%',
          letterSpacing: '-0.02em',
          fontWeight: '600',
        }],
        'h4-lg': ['1.75rem', { // 28px
          lineHeight: '140%',
          letterSpacing: '-0.02em',
          fontWeight: '500',
        }],
        'lg-lg': ['1.5rem', { // 24px
          lineHeight: '120%',
          fontWeight: '500',
        }],
        'p-lg': ['1.25rem', { // 20px
          lineHeight: '120%',
          letterSpacing: '0em',
          fontWeight: '400',
        }],
        'sm-lg': ['1.125rem', { // 18px
          lineHeight: '120%',
          letterSpacing: '0em',
          fontWeight: '400',
        }],
        'mn-lg': ['1rem', { // 16px
          lineHeight: '130%',
          letterSpacing: '0em',
          fontWeight: '300',
        }],

        // Tablet (md)
        'h1-md': ['3rem', { // 48px
          lineHeight: '98%',
          letterSpacing: '-0.02em',
          fontWeight: '700',
        }],
        'h2-md': ['2.5rem', { // 40px
          lineHeight: '98%',
          letterSpacing: '-0.02em',
          fontWeight: '600',
        }],
        'h3-md': ['2rem', { // 32px
          lineHeight: '120%',
          letterSpacing: '-0.02em',
          fontWeight: '600',
        }],
        'h4-md': ['1.5rem', { // 24px
          lineHeight: '140%',
          letterSpacing: '-0.02em',
          fontWeight: '500',
        }],
        'lg-md': ['1.375rem', { // 22px
          lineHeight: '120%',
          fontWeight: '500',
        }],
        'p-md': ['1.125rem', { // 18px
          lineHeight: '120%',
          letterSpacing: '0em',
          fontWeight: '400',
        }],
        'sm-md': ['1rem', { // 16px
          lineHeight: '120%',
          letterSpacing: '0em',
          fontWeight: '400',
        }],
        'mn-md': ['0.875rem', { // 14px
          lineHeight: '130%',
          letterSpacing: '0em',
          fontWeight: '300',
        }],

        // Mobile (sm)
        'h1-sm': ['2.25rem', { // 36px
          lineHeight: '98%',
          letterSpacing: '-0.02em',
          fontWeight: '700',
        }],
        'h2-sm': ['2rem', { // 32px
          lineHeight: '98%',
          letterSpacing: '-0.02em',
          fontWeight: '600',
        }],
        'h3-sm': ['1.75rem', { // 28px
          lineHeight: '120%',
          letterSpacing: '-0.02em',
          fontWeight: '600',
        }],
        'h4-sm': ['1.25rem', { // 20px
          lineHeight: '140%',
          letterSpacing: '-0.02em',
          fontWeight: '500',
        }],
        'lg-sm': ['1.25rem', { // 20px
          lineHeight: '120%',
          fontWeight: '500',
        }],
        'p-sm': ['1rem', { // 16px
          lineHeight: '120%',
          letterSpacing: '0em',
          fontWeight: '400',
        }],
        'sm-sm': ['0.875rem', { // 14px
          lineHeight: '120%',
          letterSpacing: '0em',
          fontWeight: '400',
        }],
        'mn-sm': ['0.75rem', { // 12px
          lineHeight: '130%',
          letterSpacing: '0em',
          fontWeight: '300',
        }],
      },
      fontWeight: {
        h1: "700",
        h2: "600",
        h3: "600",
        h4: "400",
        large: "400",
        paragraph: "500",
      },
      textShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
};
