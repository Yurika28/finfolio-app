// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
        colors: {
            darkbg: "var(--dark-bg)",
        },
        animation: {
            ticker: 'ticker 30s linear infinite',
        },
        keyframes: {
            ticker: {
                '0%':   { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(-50%)' },
            },
        },
    }
  },
  plugins: [],
};
export default config;
