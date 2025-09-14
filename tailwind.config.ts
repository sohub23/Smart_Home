import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				"color-1": "hsl(var(--color-1))",
				"color-2": "hsl(var(--color-2))",
				"color-3": "hsl(var(--color-3))",
				"color-4": "hsl(var(--color-4))",
				"color-5": "hsl(var(--color-5))",
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					soft: 'hsl(var(--surface-soft))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					soft: 'hsl(var(--primary-soft))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					soft: 'hsl(var(--secondary-soft))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					soft: 'hsl(var(--accent-soft))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					soft: 'hsl(var(--muted-soft))'
				}
			},
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
			},
			spacing: {
				'section': 'var(--space-section)',
				'component': 'var(--space-component)',
				'element': 'var(--space-element)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				rainbow: {
					"0%": { "background-position": "0%" },
					"100%": { "background-position": "200%" },
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'ken-burns': {
					'0%': {
						transform: 'scale(1) translate(0, 0)'
					},
					'100%': {
						transform: 'scale(1.1) translate(-2%, -1%)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(2rem)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-2rem)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				}
			},
			animation: {
				rainbow: "rainbow var(--speed, 2s) infinite linear",
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'ken-burns': 'ken-burns 20s ease-in-out infinite alternate',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'slide-in': 'slide-in 0.6s ease-out',
				'scale-in': 'scale-in 0.4s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
