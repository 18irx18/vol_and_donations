import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#439A97",
        c2: "#62B6B7",
        c3: "#97DECE",
        c4: "#CBEDD5",
        d1 : "#328E6E",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight:false,
  }
} satisfies Config;
