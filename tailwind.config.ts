import type { Config } from "tailwindcss";

/**
 * Tokens de Tailwind (contrato v4 §2). Los nombres antiguos (`background`, `primary`, `muted`,
 * `secondary`, `border`…) se mantienen como alias de compatibilidad: no usarlos en código nuevo.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Los tokens nuevos van en hexadecimal (mismo valor que las variables de globals.css) para que
           funcionen los modificadores de opacidad (`bg-fire-500/[0.14]`): Tailwind no puede aplicar
           alpha a un `var()`, y descarta la clase en silencio. */
        /* Tinta (fondos) */
        ink: {
          0: "#050404",
          1: "#0b0a09",
          2: "#131110",
          3: "#1b1816",
          4: "#262220",
        },
        /* Acento principal */
        fire: {
          300: "#f0cf7a",
          400: "#e6b83a",
          500: "#d9a62a",
          600: "#b3861b",
          on: "#1a1203",
        },
        /* Acento frío (≤ 10 %) */
        sea: {
          400: "#4fd1c5",
          500: "#19b3a6",
          on: "#04211e",
        },
        /* Oro: destacado/premium. `gold` a secas sigue siendo el alias antiguo (= gold-500). */
        gold: {
          DEFAULT: "var(--gold)",
          muted: "var(--gold-muted)",
          400: "#e6b83a",
          500: "#d4a017",
        },
        /* Texto: `text-text-1` como color de Tailwind; en CSS existen también `.text-1/2/3`. */
        text: {
          1: "#f3efe8",
          2: "#bdb6ac",
          3: "#8f8a82",
        },
        line: {
          1: "rgba(255, 255, 255, 0.07)",
          2: "rgba(255, 255, 255, 0.14)",
          fire: "rgba(217, 166, 42, 0.35)",
        },
        success: "#3cc878",
        warning: "#e6b83a",
        danger: "#ff5a5a",
        info: "#4fd1c5",
        whatsapp: "#25d366",

        /* ---- Alias de compatibilidad (no usar en código nuevo) ---- */
        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        "background-card": "var(--background-card)",
        "background-elevated": "var(--background-elevated)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          muted: "var(--primary-muted)",
          foreground: "var(--primary-foreground)",
        },
        muted: "var(--text-muted)",
        secondary: "var(--text-secondary)",
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        "border-accent": "var(--border-accent)",
      },
      /* Radios: 4 (datos), 8 (controles), 16 (tarjetas). `md`/`xl` quedan mapeados a 8/16 por
         compatibilidad con el código existente; en código nuevo usar sm / DEFAULT / lg / full. */
      borderRadius: {
        none: "0",
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "16px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        card: "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 50px -30px rgba(0,0,0,0.8)",
        fire: "0 12px 40px -12px rgba(217,166,42,0.45)",
        pop: "0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 60px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Archivo", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        display: "-0.01em",
        label: "0.14em",
        wordmark: "0.08em",
      },
      zIndex: {
        nav: "50",
        player: "90",
        overlay: "100",
        modal: "110",
        toast: "120",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        loginBlob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "40%": { transform: "translate(4%, 6%) scale(1.06)" },
          "70%": { transform: "translate(-3%, 3%) scale(0.97)" },
        },
        loginFadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "hero-gradient": "gradientShift 12s ease infinite",
        "login-blob": "loginBlob 20s ease-in-out infinite",
        "login-fade-in": "loginFadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
