/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        "background-elevated": "var(--color-background-elevated)",
        "background-muted": "var(--color-background-muted)",
        foreground: "var(--color-foreground)",
        "foreground-muted": "var(--color-foreground-muted)",
        "foreground-subtle": "var(--color-foreground-subtle)",
        border: "var(--color-border)",
        "border-hover": "var(--color-border-hover)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        "input-bg": "var(--color-input-bg)",
        "input-border": "var(--color-input-border)",
        "input-focus": "var(--color-input-focus)",
      },
    },
  },
  plugins: [],
};
