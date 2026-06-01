export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          light: "rgb(var(--primary-light) / <alpha-value>)",
        },
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-hover": "rgb(var(--border-hover) / <alpha-value>)",
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        // Legacy/Alias support
        ink: "rgb(var(--text-primary) / <alpha-value>)",
        line: "rgb(var(--border) / <alpha-value>)",
        brand: "rgb(var(--primary) / <alpha-value>)",
        mint: "rgb(var(--background) / <alpha-value>)",
        amber: "#f59e0b",
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(var(--primary), 0.2)',
        'inner-glass': 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      }
    }
  },
  plugins: []
};
