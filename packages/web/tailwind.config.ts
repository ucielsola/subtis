import { type Config } from 'tailwindcss';

export default {
  theme: { extend: {} },
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  plugins: [require('@tailwindcss/forms')],
} satisfies Config;
