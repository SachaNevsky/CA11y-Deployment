import { heroui } from '@heroui/theme';
import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@heroui/theme/dist/components/(slider|popover).js"
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				warmGreen: {
					DEFAULT: "#BDEAA7",
					400: "#9EE07E",
					300: "#BDEAA7",
					100: "#E4F6DB",
					600: "#62C830",
					800: "#4E9F26"
				},
				warmAmber: {
					DEFAULT: "#FFECB3",
					100: "#fff2cc",
					300: "#FFE599",
					400: "#FFD967",
					600: "#E7AD00",
					800: "#CE9A00"
				}
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
			},
			animation: {
				"fade-in": "fadeIn 0.3s ease-out forwards",
			},
		},
	},
	plugins: [heroui({
		themes: {
			light: {
				colors: {
					primary: {
						DEFAULT: "#2b7fff"
					},
					secondary: {
						DEFAULT: "#52525B"
					}
				}
			}
		}
	})],
};
export default config;
