import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            spacing: {
                header: "5rem",
            },
            colors: {
                // Stadium palette — matches the Pitchr design bundle
                paper: "#F4F2EC",
                ink: "#0B0F0A",
                ink2: "#4A5148",
                line: "#E4E1D6",
                brand: "#1E3A8A",
                "brand-soft": "#E0E7FF",
                "brand-ink": "#9D0010",
                accent: "#F59E0B",
            },
            fontFamily: {
                sans: ['var(--font-inter)', "-apple-system", "system-ui", "sans-serif"],
                display: ['var(--font-display)', "Inter", "system-ui", "sans-serif"],
                hand: ['var(--font-hand)', "cursive"],
                mono: ['var(--font-mono)', "ui-monospace", "monospace"],
            },
            boxShadow: {
                s1: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(15,25,15,0.06)",
            },
        },
    },
    plugins: [],
} satisfies Config;
